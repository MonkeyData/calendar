function Calendar() {
  this.calIsOpen = false;
  this.presetIsOpen = false;
  this.element = null;
  this.start_date = null;
  this.end_date = null;
  this.current_date = null;

  var self = this;

  $('.dr-presets').click(function() {
    self.presetToggle();
  });

  $('.dr-date').click(function() {
    self.calendarOpen(this);
  });

  $('.dr-date').keydown(function(event){
    if (event.keyCode == 13) { // Enter
      event.preventDefault();
      self.calendarOpen(this);
    }
    if (event.keyCode == 27) { // ESC
      self.calendarClose('force'); 
    }
  });

  $('.dr-month-switcher i').click(function() {
    var m = $('.dr-month-switcher span').html();
    var y = $('.dr-year-switcher span').html();
    var back = moment(new Date(m +', '+ y)).subtract(1, 'month').format('MMMM');
    var forward = moment(new Date(m +', '+ y)).add(1, 'month').format('MMMM');

    if ($(this).hasClass('icon-left')) {  
      $(this).parent().find('span').html(back);
      self.calendarOpen(this.element, moment(new Date(back +', '+ y)));
    } else if ($(this).hasClass('icon-right')) {
      $(this).parent().find('span').html(forward);
      self.calendarOpen(this.element, moment(new Date(forward +', '+ y)));
    }
  });

  $('.dr-year-switcher i').click(function() {
    var m = $('.dr-month-switcher span').html();
    var y = $('.dr-year-switcher span').html();
    var back = moment(new Date(m +', '+ y)).subtract(1, 'year').format('YYYY');
    var forward = moment(new Date(m +', '+ y)).add(1, 'year').format('YYYY');

    if ($(this).hasClass('icon-left')) {  
      $(this).parent().find('span').html(back);
      self.calendarOpen(this.element, moment(new Date(m +', '+ back)));
    } else if ($(this).hasClass('icon-right')) {
      $(this).parent().find('span').html(forward);
      self.calendarOpen(this.element, moment(new Date(m +', '+ forward)));
    }
  });

  $('.daterange').click(function(event) {
    $('html').one('click',function() {
      if (self.presetIsOpen)
        self.presetToggle();

      if (self.calIsOpen)
        self.calendarClose('force');
    });

    event.stopPropagation();
  });
}


Calendar.prototype.presetToggle = function() {
  if (this.presetIsOpen == false) {
    this.presetIsOpen = true;
  } else if (this.presetIsOpen) {
    this.presetIsOpen = false;
  }

  if (this.calIsOpen == true)
    this.calendarClose();

  $('.dr-preset-list').slideToggle(200);
  $('.dr-input').toggleClass('active');
  $('.dr-presets').toggleClass('active');
}


Calendar.prototype.calendarOpen = function(element, switcher) {
  var self = this;
  var other;
  var cal_width = $('.dr-dates').innerWidth() - 8;
  var s = new Date($('.dr-date-start').html());
  var e = new Date($('.dr-date-end').html());
  var c = new Date($(element).html());
  this.element = element || this.element;
  this.start_date = s == 'Invalid Date' ? this.start_date : s;
  this.end_date = e == 'Invalid Date' ? this.end_date : e;
  this.current_date = c == 'Invalid Date' ? this.current_date : c;

  if (this.presetIsOpen == true)
    this.presetToggle();

  if (this.calIsOpen == true)
    this.calendarClose(switcher ? 'switcher' : undefined);

  this.calendarCreate(switcher);

  $('.dr-month-switcher span').html(moment(switcher || this.current_date).format('MMMM'));
  $('.dr-year-switcher span').html(moment(switcher || this.current_date).format('YYYY'));

  $('.dr-day').on({
    mouseenter: function() {
      var this_date = moment($(this).data('date'));
      var start_date = moment(self.start_date);
      var end_date = moment(self.end_date);
      var current_date = moment(self.current_date);

      if (start_date.isSame(current_date)) {
        $(this).addClass('hover hover-before');
        $('.dr-start').css({'border': 'none', 'padding-left': '0.3125rem'});
        setMaybeRange('start');
      }

      if (end_date.isSame(current_date)) {
        $(this).addClass('hover hover-after');
        $('.dr-end').css({'border': 'none', 'padding-right': '0.3125rem'});
        setMaybeRange('end');
      }

      $('.dr-selected').css('background-color', 'transparent');

      function setMaybeRange(type) {
        other = undefined;
        var element_i = $('[data-date="'+ this_date._i +'"]');
        var i = 0;

        _.each(_.range(6 * 7), function(i) {
          if (type == 'start')
            if (moment(element_i.next().data('date')).isSame(self.end_date))
              return false;

          if (type == 'end')
            if (moment(element_i.prev().data('date')).isSame(self.start_date))
              return false;


          if (type == 'start') {
            if (moment(element_i.data('date')).isAfter(self.end_date)) {
              if (i > 5) {
                other = $(element_i).addClass('dr-end');
                return false;
              }
            } i++;
          }

          if (type == 'end') {
            if (moment(element_i.data('date')).isBefore(self.start_date)) {
              if (i > 5) {
                other = $(element_i).addClass('dr-start');
                return false;
              } 
            } i++;
          } 

          if (type == 'start')
            element_i = element_i.next().addClass('dr-maybe');

          if (type == 'end')
            element_i = element_i.prev().addClass('dr-maybe');
        });
      }
    },
    mouseleave: function() {
      $(this).removeClass('hover hover-before hover-after');
      $('.dr-start, .dr-end').css({'border': '', 'padding': ''});
      $('.dr-maybe:not(.dr-current)').removeClass('dr-start dr-end');
      $('.dr-day').removeClass('dr-maybe');
      $('.dr-selected').css('background-color', '');
    },
    mousedown: function() {
      var date = $(this).data('date');
      var string = moment(date).format('MMMM D, YYYY');

      if (other) {
        var d = other.data('date');
        $('.dr-date').not(self.element).html(moment(d).format('MMMM D, YYYY'));
      }

      $(self.element).html(string);
      self.calendarOpen(self.element);
    }
  });

  $('.dr-calendar')
    .css('width', cal_width)
    .slideDown(200);
  $('.dr-input').addClass('active');
  $(element).addClass('active');

  this.calIsOpen = true;
}


Calendar.prototype.calendarClose = function(type) {
  if (!this.calIsOpen || this.presetIsOpen || type == 'force') {
    $('.dr-calendar').slideUp(200, function() {
      $('.dr-day').remove();
    });
  } else {
    $('.dr-day').remove();
  }

  if (type == 'switcher')
    return false;

  $('.dr-input').removeClass('active');
  $('.dr-date').removeClass('active');

  this.calIsOpen = false;
}


Calendar.prototype.calendarArray = function(start, end, current, switcher) {
  var start = start || new Date();
  var end = end || moment(start).add(1, 'week');
  var current = current || start || end;

  var first_day = moment(switcher || current).startOf('month');
  var last_day = moment(switcher || current).endOf('month');

  var current_month = {
    start: {
      day: +first_day.format('d'), 
      str: +first_day.format('D')
    }, 
    end: {
      day: +last_day.format('d'), 
      str: +last_day.format('D')
    }
  }


  // Beginning faded dates
  var d = undefined;

  var start_hidden = _.map(_.range(current_month.start.day), function() {
    if (d == undefined) {
      d = moment(first_day);
    } d = d.subtract(1, 'day');

    return {
      str: +d.format('D'),
      start: d.isSame(start),
      end: d.isSame(end),
      selected: d.isBetween(start, end),
      date: d.toISOString(),
      fade: true
    }
  }).reverse();


  // Leftover faded dates
  var leftover = (6 * 7) - (current_month.end.str + start_hidden.length);
  d = undefined;

  var end_hidden = _.map(_.range(leftover), function() {
    if (d == undefined) {
      d = moment(last_day);
    } d = d.add(1, 'day');

    return {
      str: +d.format('D'),
      start: d.isSame(start),
      end: d.isSame(end),
      selected: d.isBetween(start, end),
      date: d.toISOString(),
      fade: true
    }
  });


  // Actual visible dates
  d = undefined;

  var visible = _.map(_.range(current_month.end.str), function() {
    if (d == undefined) {
      d = moment(first_day);
    } else {
      d = d.add(1, 'day');
    }

    return {
      str: +d.format('D'),
      start: d.isSame(start),
      end: d.isSame(end),
      current: d.isSame(current),
      selected: d.isBetween(start, end),
      date: d.toISOString()
    }
  });


  return start_hidden.concat(visible, end_hidden);
}


Calendar.prototype.calendarCreate = function(switcher) {
  var array = this.calendarArray(this.start_date, this.end_date, this.current_date, switcher);

  _.each(array, function(d, i) {
    var classString = "dr-day";

    if (d.fade)
      classString += " dr-fade";

    if (d.start)
      classString += " dr-start";

    if (d.end)
      classString += " dr-end";

    if (d.current)
      classString += " dr-current";
    
    if (d.selected)
      classString += " dr-selected";

    $('.dr-day-list').append('<li class="'+ classString +'" data-date="'+ d.date +'">'+ d.str +'</li>');
  });
}


var cal = new Calendar();