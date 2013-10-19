/**
 * A link that pops up a version dialog box
 */

Ext.define('Rally.technicalservices.InfoLink',{
    extend: 'Ext.Component',
    alias: 'widget.tsinfolink',
    
    /**
     * @cfg {String} informationHtml
     * Additional text to be displayed on the popup dialog (for exmaple,
     * to add a description of the app's use or functionality)
     */
    informationHtml: null,
    
    /**
     * 
     * cfg {String} title
     * The title for the dialog box
     */
     text: "Information",
    
    renderTpl: "<div id='{id}-infolinkWrap' class='tsinfolink'>TS</div>",

    initComponent: function() {
        this.callParent(arguments);
       
    },
    
    onRender: function() {
        this.callParent(arguments);
        this.mon(this.el,'click',this.onClick,this);
    },
    
    _determineSize: function(container) {
        console.log(container.xtype,container,container.getEl());
        if ( container.ownerCt ) {
            this._determineSize(container.ownerCt);
        } else if ( container.xtype === "viewport" ) {
            console.log("--");
            console.log(container.getEl().dom.outerHTML);
        }
        return null;
    },
    onClick: function(e) {
        var me = this;
        // var current_size = this._determineSize(this);
        
        var dialog_items = [];
        
        if ( this.informationHtml ) {
            dialog_items.push({
                xtype:'container',
                html: this.informationHtml
            });
        }
                
        dialog_items.push({
            xtype:'container',
            html:"This app was created by the Rally Technical Services Team."
        });
        
        if ( APP_BUILD_DATE ) {
            dialog_items.push({
                xtype:'container',
                html:'Build date/time: ' + APP_BUILD_DATE
            });
        }
        
        if (this.dialog){this.dialog.destroy();}
        this.dialog = Ext.create('Rally.ui.dialog.Dialog',{
            defaults: { padding: 5, margin: 5 },
            closable: true,
            draggable: true,
            title: me.title,
            items: dialog_items
        });
        this.dialog.show();
    }
});