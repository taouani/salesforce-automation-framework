({
          render: function(component, helper) {
            var div = document.createElement('div');
            div.className = 'custom-render';
            div.textContent = 'Rendered Content';
            return div;
          },
          afterRender: function(component, helper) {
            this.superAfterRender();
            var element = component.getElement();
            element.addEventListener('click', function() {
              console.log('Clicked');
            });
          }
        })