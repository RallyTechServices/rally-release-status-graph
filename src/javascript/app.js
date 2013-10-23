Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    logger: new Rally.technicalservices.logger(),
    items: [
        {xtype:'container',itemId:'selector_box',margin: 5, layout:{type:'hbox'}},
        {xtype:'container',itemId:'chart_box' },
        {xtype:'tsinfolink'}
    ],
    launch: function() {
        this._addSummary();
    },
    _addSummary: function() {
        var selector_box = this.down('#selector_box');
        selector_box.add({
            xtype:'rallyreleasecombobox',
            itemId:'releasebox',
            listeners: {
                scope: this,
                change: function(rb, new_value, old_value) {
                    this._asynch_return_flags = {};
                    this._getSprints();
                    this._getInitialData();
                },
                ready: function(rb) {
                    this._asynch_return_flags = {};
                    this._getSprints();
                    this._getInitialData();
                }
            }
        });

        selector_box.add({
            xtype:'container',
            itemId:'summary',
            tpl: "<table class='summary'><tr>" +
                "<td class='summary'>Total Planned US Points: <b>{total_story_estimate}</b></td>" +
                "<td class='summary'>Accepted US Points: <b>{total_accepted_story_estimate}</b></td>" +
                "<td class='summary'>Total DE Points: <b>{total_defect_estimate}</b></td>" +
                "<td class='summary'>Accepted DE Points: <b>{total_accepted_defect_estimate}</b></td>" +
                "</tr></table>",
            data: { }
        });
    },
    _defineIterationQuery:function() {
        var release = this.down('#releasebox').getRecord();
        var start_date_iso = Rally.util.DateTime.toIsoString(release.get('ReleaseStartDate'), true);
        var end_date_iso = Rally.util.DateTime.toIsoString(release.get('ReleaseDate'), true);
//
        // All sprints that touch the release dates
//        var start_query = Ext.create('Rally.data.QueryFilter',{ 
//                property: "StartDate", operator:">=", value: start_date_iso
//            }).and( Ext.create('Rally.data.QueryFilter',{
//                property: "StartDate", operator:"<=", value: end_date_iso
//            })
//        );
//        var end_query = Ext.create('Rally.data.QueryFilter',{ 
//                property: "EndDate", operator:">=", value: start_date_iso 
//            }).and( Ext.create('Rally.data.QueryFilter',{
//                property: "EndDate", operator:"<=", value: end_date_iso
//            })
//        );
//        var iteration_query = start_query.or(end_query);

        // All sprints inside the release dates:
        var iteration_query = Ext.create('Rally.data.QueryFilter',{ 
                property: "StartDate", operator:">=", value: start_date_iso 
            }).and( Ext.create('Rally.data.QueryFilter',{
                property: "EndDate", operator:"<=", value: end_date_iso
            })
        );        
        
        this.logger.log(this,"iterations that match",iteration_query.toString());
        return iteration_query;
    },
    _getInitialData: function() {
        this.logger.log(this,"_getInitialData");
        this.initial_estimate = 0;
        
        var release = this.down('#releasebox').getRecord() ;

        var start_date_iso = Rally.util.DateTime.toIsoString(release.get('ReleaseStartDate'), true);
        
        Ext.create('Rally.data.WsapiDataStore',{
            model:'Release',
            autoLoad: true,
            limit:'Infinity',
            fetch: ['ObjectID'],
            filters: [{property:'Name',value:release.get('Name')}],
            listeners: {
                scope: this,
                load: function(store,releases){
                    var me = this;
                    Ext.Array.each(releases,function(team_release){
                        me._asynch_return_flags[team_release.get('ObjectID')] = true;
                        me._getReleaseCumulativeFlow(team_release.get('ObjectID'), start_date_iso);
                    });
                }
            }
        });
    },
    _getReleaseCumulativeFlow: function(release_oid, iso_date) {
        this.logger.log(this,"_getReleaseCumulativeFlow",release_oid,iso_date);
        Ext.create('Rally.data.WsapiDataStore',{
            model:'ReleaseCumulativeFlowData',
            filters:[
                {property:'ReleaseObjectID',value:release_oid},
                {property:'CreationDate',value:iso_date},
                {property:'CardEstimateTotal',operator:'>',value: 0}
            ],
            autoLoad: true,
            listeners: {
                scope: this,
                load: function(store,cfd){
                    var me = this;
                    Ext.Array.each(cfd,function(card){
                        me.logger.log(me,release_oid,card.get('CardEstimateTotal'));
                        me.initial_estimate += parseFloat(card.get('CardEstimateTotal'),10);
                    });
                    delete this._asynch_return_flags[release_oid];
                    this._prepareChartData();
                }
            }
        });
    },
    _getSprints: function() {
        var me = this;
        me.logger.log(this,"_getSprints");
        this.sprint_hash = {};
        // anti_sprint holds data for release artifacts not in approved sprints
        this.anti_sprint = Ext.create('Sprint',{ "Name": "Other" });
        
        this._asynch_return_flags['current'] = true;
        
        // clear display
        this.down('#chart_box').removeAll();
        if ( this.down('#summary') ) {
            this.down('#summary').update({});
        }
        
        Ext.create('Rally.data.WsapiDataStore',{
            model:'Iteration',
            autoLoad: true,
            limit:'Infinity',
            context: { projectScopeDown: false, projectScopeUp: false },
            fetch: ['Name','ObjectID','StartDate','EndDate'],
            filters: me._defineIterationQuery(),
            sorters: [{ property: 'StartDate' }],
            listeners: {
                scope: this,
                load: function(store,records,success){
                    if ( records.length  == 0 ) {
                        this.down('#chart_box').add({
                            xtype:'container',
                            html: "There are no iterations in this release's timebox",
                            padding: 10
                        });
                    } else {
                        Ext.Array.each(records, function(iteration){
                            var sprint = Ext.create('Sprint',{iteration:iteration});
                            me.sprint_hash[sprint.get('Name')] = sprint;
                        });
                        
                        me._getReleaseData();
                    }
                }
            }
        });
    },
    _getReleaseData: function() {
        var me = this;
        me.logger.log(this,"_getReleaseData");
        var release = this.down('#releasebox').getRecord();
        var filters = [
            {property:'PlanEstimate',operator:'>',value:0},
            {property:'Release.Name',value:release.get('Name')}
        ];
        
        var fetch = ['PlanEstimate','ScheduleState','Iteration','Name'];
        
        Ext.create('Rally.data.WsapiDataStore',{
            autoLoad: true,
            limit:'Infinity',
            model: 'UserStory',
            filters: filters,
            fetch:fetch,
            listeners: {
                scope: this,
                load: function(store,stories){
                    Ext.Array.each(stories,function(story){
                        var sprint = me.anti_sprint;
                        if ( story.get('Iteration') && me.sprint_hash[story.get('Iteration').Name]) {
                            sprint = me.sprint_hash[story.get('Iteration').Name];
                        }
                        sprint.add('total_story_estimate',story.get('PlanEstimate'));
                    });
                    Ext.create('Rally.data.WsapiDataStore',{
                        autoLoad: true,
                        limit:'Infinity',
                        model:'Defect',
                        filters:filters,
                        fetch:fetch,
                        listeners:{
                            scope: this,
                            load: function(store,defects){
                                Ext.Array.each(defects,function(defect){
                                    var sprint = me.anti_sprint;
                                    if ( defect.get('Iteration') && me.sprint_hash[defect.get('Iteration').Name]) {
                                        sprint = me.sprint_hash[defect.get('Iteration').Name];
                                    }
                                    sprint.add('total_defect_estimate',defect.get('PlanEstimate'));
                                });
                                
                                me._getAcceptedReleaseData();
                            }
                        }
                    })
                }
            }
        });
    },
    /*
     * Easier than finding out at the top whether there's a state
     * AFTER accepted, have to go get all the points that are from
     * schedule states > Completed
     */
    _getAcceptedReleaseData: function() {
        var me = this;
        me.logger.log(this,"_getAcceptedReleaseData");
        var release = this.down('#releasebox').getRecord();
        var filters = [
            {property:'PlanEstimate',operator:'>',value:0},
            {property:'ScheduleState',operator:'>',value:'Completed'},
            {property:'Release.Name',value:release.get('Name')}
        ];
        var fetch = ['PlanEstimate','ScheduleState','Iteration','Name'];
        
        Ext.create('Rally.data.WsapiDataStore',{
            autoLoad: true,
            limit:'Infinity',
            model: 'UserStory',
            filters: filters,
            fetch:fetch,
            listeners: {
                scope: this,
                load: function(store,stories){
                    Ext.Array.each(stories,function(story){
                        var sprint = me.anti_sprint;
                        if ( story.get('Iteration') && me.sprint_hash[story.get('Iteration').Name]) {
                            sprint = me.sprint_hash[story.get('Iteration').Name];
                        }
                        
                        sprint.add('total_accepted_story_estimate',story.get('PlanEstimate'));
                    });
                    Ext.create('Rally.data.WsapiDataStore',{
                        autoLoad: true,
                        limit:'Infinity',
                        model:'Defect',
                        filters:filters,
                        fetch:fetch,
                        listeners:{
                            scope: this,
                            load: function(store,defects){
                                Ext.Array.each(defects,function(defect){
                                    var sprint = me.anti_sprint;
                                    if ( defect.get('Iteration') && me.sprint_hash[defect.get('Iteration').Name]) {
                                        sprint = me.sprint_hash[defect.get('Iteration').Name];
                                    }
                                    sprint.add('total_accepted_defect_estimate',defect.get('PlanEstimate'));
                                });
                                delete this._asynch_return_flags['current'];
                                me._prepareChartData();
                            }
                        }
                    })
                }
            }
        });

    },
    _allAsynchronousCallsReturned: function() {
        this.logger.log(this,"Still waiting for:", this._asynch_return_flags);
        return ( Ext.Object.getKeys(this._asynch_return_flags).length == 0 );
    },
    _prepareChartData: function() {
        var chart_data = {
            categories: [""],
            total_by_sprint: [0],
            ideal_by_sprint: [],
            ideal_by_sprint_by_initial: []
        };
        if (this._allAsynchronousCallsReturned()){
            var me = this;
            this.logger.log(this,"sprint_hash",me.sprint_hash, me.initial_estimate);
            var totals = {
                total_accepted_story_estimate:me.anti_sprint.get('total_accepted_story_estimate'),
                total_accepted_defect_estimate:me.anti_sprint.get('total_accepted_defect_estimate'),
                total_story_estimate:me.anti_sprint.get('total_story_estimate'),
                total_defect_estimate:me.anti_sprint.get('total_defect_estimate'),
                total_estimate:me.anti_sprint.get('total_estimate')
            };
            var accepted_running_total = 0;
            
            Ext.Object.each(this.sprint_hash, function(name,sprint){
                me.logger.log(me,"sprint",name);
                chart_data.categories.push(sprint.get('Name'));
                accepted_running_total += sprint.get('total_accepted_story_estimate');
                accepted_running_total += sprint.get('total_accepted_defect_estimate');
                chart_data.total_by_sprint.push(accepted_running_total);
                
                Ext.Object.each(totals, function(key,value){
                    totals[key] += sprint.get(key);
                });
                
            });
            
            this.down('#summary').update(totals);
            
            // make ideal line for current scope
            if ( totals.total_estimate > 0 && chart_data.total_by_sprint.length > 1 ) {
                var ideal_per_sprint = totals.total_estimate / ( chart_data.total_by_sprint.length - 1 );
                var running_ideal = 0;
                Ext.Array.each(chart_data.total_by_sprint,function(counter){
                    chart_data.ideal_by_sprint.push(running_ideal);
                    running_ideal += ideal_per_sprint;
                });
            }
            // make ideal line for initial scope
            var running_ideal = 0;
            var ideal_by_sprint_by_initial = 0;
            if ( this.initial_estimate > 0 && chart_data.total_by_sprint.length > 1 ) {
                ideal_by_sprint_by_initial = this.initial_estimate / ( chart_data.total_by_sprint.length - 1 );
            }
            Ext.Array.each(chart_data.total_by_sprint,function(counter){
                chart_data.ideal_by_sprint_by_initial.push(running_ideal);
                running_ideal += ideal_by_sprint_by_initial;
            });
                
            this._makeChart(chart_data);
        }
    },
    _makeChart: function(chart_data){
        this.logger.log(this,"_makeChart",chart_data);
        this.down('#chart_box').removeAll();
        this.down('#chart_box').add({
            xtype:'rallychart',
            chartData: {
                categories: chart_data.categories,
                series: [{
                    type:'line',
                    data:chart_data.total_by_sprint,
                    visible: true,
                    name: 'Accepted US/DE Pts'
                },
                {
                    type:'line',
                    data:chart_data.ideal_by_sprint,
                    visible: true,
                    name: 'Total Planned US/DE Pts'
                
                },
                {
                    type:'line',
                    data:chart_data.ideal_by_sprint_by_initial,
                    visible: true,
                    name: 'Initial Planned US/DE Pts'
                }]
            },
            height: 600,
            chartConfig: {
                chart: {},
                title: {
                    text: 'Release Status',
                    align: 'center'
                },
                yAxis: [{
                    title: {
                        enabled: true,
                        text: 'Story Points',
                        style: { fontWeight: 'normal' }
                    },
                    min: 0
                }],
                xAxis: [{
                    title: {
                        enabled: true,
                        text: 'Iterations'
                    },
                    minorTickInterval: null, 
                    tickLength: 0,
                    categories: chart_data.categories,
                    labels: {
                        rotation: 90,
                        align: 'left'
                    }
                }]
            }
        });
    }
});