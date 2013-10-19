Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    logger: new Rally.technicalservices.logger(),
    items: [
        {xtype:'container',itemId:'message_box',tpl:'Hello, <tpl>{_refObjectName}</tpl>'},
        {xtype:'tsinfolink'}
    ],
    launch: function() {
        this.down('#message_box').update(this.getContext().getUser());
    }
});