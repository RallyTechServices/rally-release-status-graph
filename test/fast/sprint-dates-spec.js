describe("Sprint Object dates", function() {
    describe("When creating sprint objects", function(){
        it("giving no date values should return null",function(){
            var sprint = Ext.create('Sprint',{});
            
            expect(sprint.get('end_date')).toBe(null);
            expect(sprint.get('start_date')).toBe(null);
        });
        it("giving javascript date values should return properly",function(){
            var sprint = Ext.create('Sprint',{
                start_date: friday_start,
                end_date: thursday_end
            });
            
            expect(sprint.get('end_date')).toEqual(thursday_end);
            expect(sprint.get('start_date')).toEqual(friday_start);
        });
        it("giving iso date values should return properly",function(){
            var sprint = Ext.create('Sprint',{
                start_date: Rally.util.DateTime.toIsoString(friday_start),
                end_date: Rally.util.DateTime.toIsoString(thursday_end)
            });
            
            expect(sprint.get('end_date')).toEqual(thursday_end);
            expect(sprint.get('start_date')).toEqual(friday_start);
        });
    });
    
    describe("When setting the sprint data object's iteration", function(){
        it("giving no date values should return null",function(){
            var iteration = Ext.create('mockIteration',{
                Name: "fred",
                ObjectID: 123
            });
            
            var sprint = Ext.create('Sprint',{
                iteration: iteration
            });
            
            expect(sprint.get('end_date')).toBe(null);
            expect(sprint.get('start_date')).toBe(null);
            expect(sprint.get('ObjectID')).toEqual(123);
            expect(sprint.get('Name')).toEqual("fred");
        });
        it("giving date values should return those dates",function(){
            var iteration = Ext.create('mockIteration',{
                StartDate: monday_start,
                EndDate: tuesday_end,
                Name: "fred",
                ObjectID: 123
            });
            
            var sprint = Ext.create('Sprint',{
                iteration: iteration
            });
            
            expect(sprint.get('end_date')).toEqual(tuesday_end);
            expect(sprint.get('start_date')).toEqual(monday_start);
            expect(sprint.get('ObjectID')).toEqual(123);
            expect(sprint.get('Name')).toEqual("fred");
        });
    });
});