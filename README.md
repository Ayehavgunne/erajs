# caljs (working title)
A calendar/date picker that replicates the functionality of YUI's date picker without being a giant UI library.

---
## Tales of woe

I needed a date picker. One that would allow me to select arbitrary dates and date ranges. I have had difficulty finding
something that could do both. I did find a ton of date pickers that could select a range using two clicks on two dates
creating a continuous range. I didn't want that because I frequently want to exclude the weekends from my selections.
I did find some date pickers that allowed me to select arbitrary dates... if I clicked each one at a time.

Then I found the YUI date picker which made me happy sad. I was happad or sappy. Sappy sounds better.

So I was sappy because I found a library that gave me what I wanted plus a whole lot more that I didn't need.
I could select individual days with a single click. I could select multiple arbitrary days with ctrl-click. I could select
ranges with shift-click. It worked the way all multi-selection does everywhere else in computing. Why has this been so hard to
find for HTML/JavaScript based date pickers?!

Anyway, YUI was more than I really needed. I just wanted the date picker but it came with a whole suite of tools to creating
UI's of cource. I didn't know how to pull out just the picker from the rest of the library. I don't think there was a custom
build tool for selecting individual components like what JQuery UI has.

I have been using YUI for a while now but I recently said this is enough! So here is a date picker that will do exactly what I
want and anyone else that wants the same thing can use it if they need to.

## Dependencies
[moment.js](https://momentjs.com)

## Usage
```javascript
let container = document.getElementById('some_container') // Where the calendar will reside in HTML
let hndl = document.getElementById('some_handle') // The element that when clicked with reveal the hidden calendar
let calendar = cal({element: container, handle: hndl, on_select: function(dates) {
  //your code here
  //dates is an array of the current selected dates as moments via moment.js
}})
calendar.destroy()

```

## API
### Options
```element: HTMLElement``` the container that the calendar is initialized into

```handle: HTMLElement``` the element that the calendar will be tied to when shown. Click the handle to show the calendar, click outside the calendar to close it

```number_of_months: 1``` numer of months to display, not working yet
   
```date_format: 'YYYY-MM-DD'``` how the dates will be formated internally. See moment.js docs for format options. Each td element in the calendar will have a data-date attribute with the date formated from this string

```ctrl_click: true``` turns on/off ctrl-clicking to select/deselect dates
 
```shift_click: true``` turns on/off shift-clicking to select date ranges

```vertical_offset: 0``` setting to vertically move the picker from the handle in pixles, negative for left and positive for right

```horizontal_offset: 0``` setting to horizonally move the picker from the handle in pixles, positive for up and negative for down

```shortcuts: true``` show/hide the shortcut buttons below the calendar

```custom_shortcuts: []``` an array of javascript objects with the properties of 'label', (html)'class' and 'callback' that will add custom shortcuts, the callback function should accept the options object and event object as parameters and return the dates to be selected. The currently selected dates will be cleared out when this function executes

```on_select: function () {}``` callback function that is executed when selections are made

```on_open: function () {}``` callback function that is executed when the calendar is opened/shown

```on_close: function () {}``` callback function that is executed when the calendar is closed/hidden

```on_destroy: function () {}``` callback function that is executed when the calendar gets destroyed

```class_cal: 'caljs-cal_div'``` class name of the calendar container

```class_selected: 'caljs-selected_date'``` class name of the selected date that are viewable in the current range of the calendar

```class_active: 'caljs-active'``` class name of the selectable dates, the dates in the currently viewable month

```class_inactive: 'caljs-inactive'``` class name of the dates outside the currently viewable month

```class_today_highlight: 'caljs-today_highlight'``` class name of the current date

```class_days: 'caljs-days'``` class name of the div inside each td representing the dates, allows the styling of the hover effect

```class_back_arrow: 'caljs-back_arrow'``` class name of the back button

```class_forward_arrow: 'caljs-forward_arrow'``` class name of the forward button

```class_shortcuts: 'caljs-shortcuts'``` class name of the shortcuts container

```class_shortcuts_title: 'caljs-shortcuts_title'``` class name of the shortcuts title

```class_deselect_weekends: 'caljs-deselect_weekends'``` class name of the Deselect Weekends shortcut

```class_mtd: 'caljs-mtd'``` class name of the Month to Date shortcut

```class_today: 'caljs-today'``` class name of the Today shortcut

```class_yesterday: 'caljs-yesterday'``` class name of the Yesterday shortcut

```class_this_week: 'caljs-this_week'``` class name of the This Week shortcut

```class_last_week: 'caljs-last_week'``` class name of the Last Week shortcut

```class_clear: 'caljs-clear'``` class name of the Clear shortcut

```back_button: '&#9664;'``` text of the back button

```forward_button: '&#9654;'``` text of the forward button

### Methods
```.destroy()``` destroys the calendar, sets things back to before the calendar was initialized

```.get_dates()``` gets the currently selected dates, returns an array of moments

```.set_dates(dates)``` sets the currently selected dates clearing the current selection, pass in an array of moments or pass in nothing to clear the current selection

```.add_dates(dates)``` add to the currently selected dates, pass in an array of moments

```.remove_dates(dates)``` remove from the currently selected dates, pass in an array of moments

### Properties
```.options``` the current options of the calendar, changing some of the properties of the options after initialization will still effect the functionality of the calendar. Contains an array of objects representing the currently selected dates. The objects have two properties, a ```date``` property and a ```last_clicked``` property that is a boolean for if that was the last date clicked on  

### Events
All handler functions should be attached to the container element (the ```element``` in the options) that the calendar was initialized into

```'caljs-select'``` event that is fired when selections on the calendar are made, event property ```detail``` will contain an array of the dates that are currently selected

```'caljs-open'``` event that is fired when the calendar is opened/shown

```'caljs-close'``` event that is fired when the calendar is closed/hidden

```'caljs-destroy'``` event that is fired when the calendar is destroyed

## Additional Info
Included is a css file with basic styling that can be tweeked to your hearts content. Seemed important to mention that since I 
have no idea how to make things look good.

Ctrl-clicking on the shortcuts (if they add dates) will add to your current selection
Shift-clicking on the Today and Yestarday shortcuts will select a range from the last clicked date  

## TODO

- Add more keyboard shortcuts for navigation
- Add more look and feel customization
- Pretty it up... somehow
