# EraJs
A calendar/date picker that replicates the functionality of YUI's date picker without being a giant UI library.

[Demos!](https://ayehavgunne.github.io/erajs/)  
[API](https://ayehavgunne.github.io/erajs/api.html)  
[About](https://ayehavgunne.github.io/erajs/about.html)  

---

## Dependencies
[moment.js](https://momentjs.com)

## Usage
```javascript
let container = document.getElementById('some_container') // Where the calendar will reside in HTML
let hndl = document.getElementById('some_handle') // The element that when clicked with reveal the hidden calendar
let era = Era({element: container, handle: hndl, on_select: function(dates) {
  // your code here
  // dates is an array of the current selected dates as moments via moment.js
}})
era.destroy()

``` 

## TODO

- Add forward and back buttons for Year to move years at a time
- Get localization to work
- Make a mobile friendly version
- Add more keyboard shortcuts for navigation
- Add more look and feel customization
- Pretty it up... somehow
