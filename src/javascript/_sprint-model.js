convertEstimate = function(value,record) {
    
    if ( isNaN(value) || value === null ) {
        value = 0;
    }
    return value;
};

convertTotalEstimate = function(value,record) {
    var total = 0;
    if ( ! isNaN( record.get('total_defect_estimate') ) ) {
        total += record.get('total_defect_estimate');
    }
    if ( ! isNaN( record.get('total_story_estimate') ) ) {
        total += record.get('total_story_estimate');
    }
    return total;
};

convertObjectID = function(value,record) {
    if ( record.get('iteration') && record.get('iteration').get('ObjectID') ) {
        value = record.get('iteration').get('ObjectID');
    }
    return value;
};

convertName = function(value,record) {
    if ( record.get('iteration') && record.get('iteration').get('Name') ) {
        value = record.get('iteration').get('Name');
    }
    return value;
};

convertStartDate = function(value,record) {
    if ( record.get('iteration') && record.get('iteration').get('StartDate') ) {
        value = record.get('iteration').get('StartDate');
    }
    if ( typeof(value) === "string" ) {
        value = Rally.util.DateTime.fromIsoString(value);
    }
    return value;
};

convertEndDate = function(value,record) {
    if ( record.get('iteration') && record.get('iteration').get('EndDate') ) {
        value = record.get('iteration').get('EndDate');
    }
    if ( typeof(value) === "string" ) {
        value = Rally.util.DateTime.fromIsoString(value);
    }
    return value;
};

/**
  * A data collector for a single sprint (or set of sprints)
  */
Ext.define('Sprint',{
    extend:'Ext.data.Model',
    fields:[
        {name:'ObjectID',type:'int',convert:convertObjectID},
        {name:'Name',type:'string',convert:convertName},
        {name:'end_date',type:'date',defaultValue:null,convert:convertEndDate},
        {name:'start_date',type:'date',defaultValue:null,convert:convertStartDate},
        {name:'iteration',type:'auto'},
        {name:'total_accepted_defect_estimate',defaultValue:0, convert:convertEstimate},
        {name:'total_accepted_story_estimate',defaultValue:0,  convert:convertEstimate},
        {name:'total_defect_estimate',defaultValue:0, convert:convertEstimate},
        {name:'total_story_estimate',defaultValue:0,  convert:convertEstimate},
        {name:'total_estimate',defaultValue:0, convert:convertTotalEstimate}
    ],
    set: function(field_name, value) {
        this.callParent(arguments);

        if (field_name==='total_defect_estimate' || field_name==='total_story_estimate') {
            this.set('total_estimate');
        }
        
        if (field_name==='iteration') {
            this.set('ObjectID',value.get('ObjectID'));
            this.set('Name',value.get('Name'));
            this.set('end_date',value.get('EndDate'));
            this.set('start_date',value.get('StartDate'));
        }
    },
    add: function(field_name,value){
        var current_value = this.get(field_name) || 0;
        this.set(field_name, value + current_value);
    }
    

});