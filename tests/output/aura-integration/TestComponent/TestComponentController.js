({
          doInit: function(component, event, helper) {
            var msg = component.get("v.message");
            helper.loadData(component);
            component.set("v.count", 1);
          },
          handleClick: function(component, event, helper) {
            var currentCount = component.get("v.count");
            component.set("v.count", currentCount + 1);
            component.getEvent("countChanged").setParams({ count: currentCount + 1 }).fire();
          }
        })