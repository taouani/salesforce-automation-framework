({
          loadData: function(component) {
            var action = component.get("c.getData");
            action.setParams({ recordId: component.get("v.recordId") });
            action.setCallback(this, function(response) {
              if (response.getState() === "SUCCESS") {
                component.set("v.data", response.getReturnValue());
              }
            });
            $A.enqueueAction(action);
          },
          formatData: function(data) {
            return data.map(item => item.Name).join(", ");
          }
        })