describe("Sprint Object estimate", function() {
    describe("When creating empty sprint objects", function(){
        it("giving no values should return zeroes",function(){
            var sprint = Ext.create('Sprint',{});
            
            expect(sprint.get('total_defect_estimate')).toEqual(0);
            expect(sprint.get('total_story_estimate')).toEqual(0);
            expect(sprint.get('total_accepted_defect_estimate')).toEqual(0);
            expect(sprint.get('total_accepted_story_estimate')).toEqual(0);
            expect(sprint.get('total_estimate')).toBe(0);
        });
        
        it("giving null values should return zeroes",function(){
            var sprint = Ext.create('Sprint',{
                total_defect_estimate: null,
                total_story_estimate: null,
                total_accepted_defect_estimate: null
            });
            expect(sprint.get('total_defect_estimate')).toEqual(0);
            expect(sprint.get('total_story_estimate')).toEqual(0);
            expect(sprint.get('total_accepted_defect_estimate')).toEqual(0);
            expect(sprint.get('total_accepted_story_estimate')).toEqual(0);
            expect(sprint.get('total_estimate')).toBe(0);
        });
        
    });
    
    describe("When creating sprint objecs with estimate values", function(){
        it("the object should add the estimate for a total",function(){
            var sprint = Ext.create('Sprint',{
                total_defect_estimate: 1,
                total_story_estimate: 2
            });
            
            expect(sprint.get('total_defect_estimate')).toEqual(1);
            expect(sprint.get('total_story_estimate')).toEqual(2);
            expect(sprint.get('total_estimate')).toEqual(3);
        });
        
        it("setting the total_estimate directly should not override addition",function(){
            var sprint = Ext.create('Sprint',{
                total_defect_estimate: 1,
                total_story_estimate: 2,
                total_estimate: 12
            });
            
            expect(sprint.get('total_defect_estimate')).toEqual(1);
            expect(sprint.get('total_story_estimate')).toEqual(2);
            expect(sprint.get('total_estimate')).toEqual(3);
        });
        
        it("leaving out one of the estimates should not affect addition",function(){
            var sprint = Ext.create('Sprint',{
                total_story_estimate: 2
            });
            
            expect(sprint.get('total_defect_estimate')).toEqual(0);
            expect(sprint.get('total_story_estimate')).toEqual(2);
            expect(sprint.get('total_estimate')).toEqual(2);
        });
        
        it("setting total accepted is independent of calculated total",function(){
            var sprint = Ext.create('Sprint',{
                total_story_estimate: 2,
                total_accepted_story_estimate: 1
            });
            
            expect(sprint.get('total_defect_estimate')).toEqual(0);
            expect(sprint.get('total_story_estimate')).toEqual(2);
            expect(sprint.get('total_estimate')).toEqual(2);
        });
    });
    
    describe("When changing estimate values", function(){
        it("setting an estimate should change total",function(){
            var sprint = Ext.create('Sprint',{
                total_defect_estimate: 10,
                total_story_estimate: 10
            });
            sprint.set('total_defect_estimate',5);
            
            expect(sprint.get('total_defect_estimate')).toEqual(5);
            expect(sprint.get('total_story_estimate')).toEqual(10);
            expect(sprint.get('total_estimate')).toEqual(15);
        });
        
        it("adding to estimate should change total",function(){
            var sprint = Ext.create('Sprint',{
                total_defect_estimate: 10,
                total_story_estimate: 10
            });
            sprint.add('total_defect_estimate',5);
            
            expect(sprint.get('total_defect_estimate')).toEqual(15);
            expect(sprint.get('total_story_estimate')).toEqual(10);
            expect(sprint.get('total_estimate')).toEqual(25);
        });
        
        it("adding null to estimate should not change total",function(){
            var sprint = Ext.create('Sprint',{
                total_defect_estimate: 10,
                total_story_estimate: 10
            });
            sprint.add('total_defect_estimate',null);
            
            expect(sprint.get('total_defect_estimate')).toEqual(10);
            expect(sprint.get('total_story_estimate')).toEqual(10);
            expect(sprint.get('total_estimate')).toEqual(20);
        });
        
        it("adding to a nonexistent field should not fail",function(){
            var sprint = Ext.create('Sprint',{
                total_defect_estimate: 10,
                total_story_estimate: 10
            });
            sprint.add('fred_is_not_a_field',5);
            
            expect(sprint.get('total_defect_estimate')).toEqual(10);
            expect(sprint.get('total_story_estimate')).toEqual(10);
            expect(sprint.get('total_estimate')).toEqual(20);
        });
    });
});