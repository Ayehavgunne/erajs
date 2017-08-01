window.addEventListener("load", function() {
	let cal1 = document.getElementById('cal1')
	let out1 = document.getElementById('output1')
	Era({element: cal1, handle: out1, on_select: function(dates) {
		out1.value = dates.map((date) => date.format('YYYY-MM-DD')).join(', ')
	}})

	let cal2 = document.getElementById('cal2')
	let out2 = document.getElementById('output2')
	Era({element: cal2, handle: out2, on_select: function(dates) {
		out2.value = dates.map((date) => date.format('YYYY-MM-DD')).join(', ')
	}, number_of_months: 2})

	let cal3 = document.getElementById('cal3')
	let out3 = document.getElementById('output3')
	let custom_shortcut = {
		label: 'Feb10',
		class: 'feb10',
		callback: function (data, e) {
			let sel_dates = data.selected_dates // the selected dates before the click on the shortcut
			console.log(sel_dates[0].date, sel_dates[0].last_clicked) // the two properties on the selected dates
			console.log(e) // the click event object
			return [moment('20170210', 'YYYYMMDD')] // return an array of moments
		}
	}
	let era = Era({element: cal3, handle: out3, on_select: function(dates) {
		out3.value = dates.map((date) => date.format('YYYY-MM-DD')).join(', ')
	}, number_of_months: 2, custom_shortcuts: [custom_shortcut]})
	era.set_dates([moment()])
})
