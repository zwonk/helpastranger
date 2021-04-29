(function ($) {
  "use strict";

  $(function () {

  $(window).scroll(function() {
    const targetEl = $("#affected-onboard-counter")
    if(targetEl && targetEl.offset())
    {

      var top_of_element = targetEl.offset().top;
      var bottom_of_element = targetEl.offset().top + targetEl.outerHeight();
      var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
      var top_of_screen = $(window).scrollTop();

      if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
        counter1.count(
          counter1.DOM.scope.dataset.value 
        );
      } else {
      }

      var top_of_element = $("#affected-total-counter").offset().top;
      var bottom_of_element = $("#affected-total-counter").offset().top + $("#affected-total-counter").outerHeight();
      var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
      var top_of_screen = $(window).scrollTop();

      if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)){
        counter2.count(
          counter2.DOM.scope.dataset.value 
        );
      } else {
      }

    }
  });


    function Counter(selector, settings) {
      this.settings = Object.assign(
        {
          digits: 5,
          delay: 250, // ms
          direction: "", // ltr is default
        },
        settings || {}
      );

      if($(selector)){

        this.DOM = {};
        this.build(selector);

        if(this.DOM.scope)
          this.DOM.scope.addEventListener("transitionend", (e) => {
            if (e.pseudoElement === "::before" && e.propertyName == "margin-top") {
              e.target.classList.remove("blur");
            }
          });

      }

      //this.count();
    }

    Counter.prototype = {
      // generate digits markup
      build(selector) {
        if($(selector)){
          var scopeElm =
            typeof selector == "string"
              ? document.querySelector(selector)
              : selector
              ? selector
              : this.DOM.scope;

          if(scopeElm){
              scopeElm.innerHTML = Array(this.settings.digits + 1).join(
                '<div><b data-value="0"></b></div>'
              );
                
              this.DOM = {
                scope: scopeElm,
                digits: scopeElm.querySelectorAll("b"),
              };
            }
          }
      },

      count(newVal) {
        var countTo,
          className,
          settings = this.settings,
          digitsElms = this.DOM.digits;

        // update instance's value
        this.value = newVal || this.DOM.scope.dataset.value | 0;

        if (!this.value) return;

        // convert value into an array of numbers
        countTo = (this.value + "").split("");

        if (settings.direction == "rtl") {
          countTo = countTo.reverse();
          digitsElms = [].slice.call(digitsElms).reverse();
        }

        // loop on each number element and change it
        digitsElms.forEach(function (item, i) {
          if (+item.dataset.value != countTo[i] && countTo[i] >= 0)
            setTimeout(
              function (j) {
                var diff = Math.abs(countTo[j] - +item.dataset.value);
                item.dataset.value = countTo[j];
                if (diff > 3) item.className = "blur";
              },
              i * settings.delay,
              i
            );
        });
      },
    };

    /////////////// create new counter for this demo ///////////////////////

    var counter1 = new Counter(".jsCounter1", {
      direction: "ltr",
      delay: 200,
      digits: 6,
    });

    var counter2 = new Counter(".jsCounter2", {
      direction: "rtl",
      delay: 200,
      digits: 5,
    });


    /*var counterInterval = setInterval(intervalUpdateCount, 3000)
    function intervalUpdateCount() {
      counter.count(
       conter.DOM.scope.dataset.value
      );
    }*/

  });
})(jQuery);
