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
