var friday_start = new Date(2013,8,20,0,0,0);
var saturday_start = new Date(2013,8,21,0,0,0);
var sunday_start = new Date(2013,8,22,0,0,0);
var monday_start = new Date(2013,8,23,0,0,0);
var tuesday_start = new Date(2013,8,24,0,0,0);
var wednesday_start = new Date(2013,8,25,0,0,0);
var thursday_start = new Date(2013,8,26,0,0,0);
var friday_end = new Date(2013,8,20,23,59,59);
var saturday_end = new Date(2013,8,21,23,59,59);
var sunday_end = new Date(2013,8,22,23,59,59);
var monday_end = new Date(2013,8,23,23,59,59);
var tuesday_end = new Date(2013,8,24,23,59,59);
var wednesday_end = new Date(2013,8,25,23,59,59);
var thursday_end = new Date(2013,8,26,23,59,59);

var useObjectID = function(value,record) {
    if ( record.get('ObjectID') ) {
        return record.get('ObjectID');
    } 
    return 0;
};

var shiftDayBeginningToEnd = function(day) {
    return Rally.util.DateTime.add(Rally.util.DateTime.add(Rally.util.DateTime.add(day,'hour',23), 'minute',59),'second',59);
};

Ext.define('mockStory',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'ObjectID', type: 'int'},
        {name:'Name',type:'string'},
        {name:'PlanEstimate',type:'int'},
        {name:'id',type:'int',convert:useObjectID},
        {name:'ScheduleState',type:'string',defaultValue:'Defined'}
    ]
});

Ext.define('mockIteration',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'ObjectID', type: 'int'},
        {name:'Name',type:'string'},
        {name:'StartDate',type:'auto'},
        {name:'EndDate',type:'auto'},
        {name:'id',type:'int',convert:useObjectID}
    ]
});

Ext.define('mockCFD',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'CardCount',type:'int'},
        {name:'CardEstimateTotal',type:'int'},
        {name:'CardState',type:'string'},
        {name:'CardToDoTotal',type:'int'},
        {name:'CreationDate',type:'date'},
        {name:'ObjectID',type:'int'},
        {name:'TaskEstimateTotal',type:'int'}
    ]
});