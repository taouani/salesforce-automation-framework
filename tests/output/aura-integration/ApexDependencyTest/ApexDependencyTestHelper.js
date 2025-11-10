({
          loadData: function(component) {
            var action = component.get("c.getData");
            $A.enqueueAction(action);
          }
        })