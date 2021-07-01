window.onload = () => {
	init()
}

$(`[type="date"]`).on("input", evt => {
	let jControl = $(evt.target)
	let target = jControl.attr("data-target")
	let attribute = jControl.attr("data-attr")
	let value = jControl.val()
	$(`#${target}`).attr(attribute, value)
	if (value != "" && $(`#${target}`).val() != "") {
		goButtonEnabled(true);
	}
	else {
		goButtonEnabled(false);
	}
})

function init() {
	initDatePickers()
}

function initDatePickers() {
	var today = new Date()
	var dd = today.getDate().toString().padStart(2, "0")
	var mm = (today.getMonth() + 1).toString().padStart(2, "0")
	var yyyy = today.getFullYear()

	let todayDateString = `${yyyy}-${mm}-${dd}`
	$("#end, #start").attr("max", todayDateString)
}

function goButtonEnabled(enabled) {
	$("#goButton").attr("disabled", !enabled);
}

function onClickGo() {
	let jResults = $("#results")
	jResults.html("<span>loading...</span>")
	$("#goButton").attr("disabled", true)
	$.ajax({
		url: "/test",
		data: {
			from: $("#start").val(),
			to: $("#end").val(),
			locations: '[1,2,3]'
		},
		success: result => {
			console.log(result)
			let html = ""
			if (typeof result === "object") {
				html += "<table>"
				for (const [key, value] of Object.entries(result)) {
					html += `<tr><td>${key}</td><td>${value}</td><tr>`
				}
				html += "</table>"
			}
			else {
				html += `<h2>${result}</h2>`
			}
			$("#goButton").attr("disabled", false)
			jResults.html(html)
		},
		error: result => {
			console.log(result);
			$("#goButton").attr("disabled", false)
			jResults.html("Something broke, try again. If it still Doesn't work then refresh.")
		}
	});
}