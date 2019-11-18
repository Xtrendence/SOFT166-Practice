// Ensures that the DOM content has already finished loading.
$(document).ready(function() {
	light("set-power", "on");
	light("set-color", "blue");
	// To close the menu if the user clicks outside of it.
	$(".body-wrapper").on("click", function() {
		if($(this).hasClass("extended")) {
			toggleMenu("close");
		}
	});

	// To close or open the menu when the menu icon is clicked.
	$(".icon-wrapper.menu").on("click", function() {
		toggleMenu();
	});

	// To reset the game. Scores aren't preserved.
	$(".icon-wrapper.reset").on("click", function() {
		resetGame();
	});

	// To show tooltips.
	$(".icon-wrapper.menu").hover(function() {
		$(".icon-title.menu").css("opacity", "1");
	}, function() {
		$(".icon-title.menu").css("opacity", "0");
	});
	$(".icon-wrapper.reset").hover(function() {
		$(".icon-title.reset").css("opacity", "1");
	}, function() {
		$(".icon-title.reset").css("opacity", "0");
	});
	$(".icon-wrapper.github").hover(function() {
		$(".icon-title.github").css("opacity", "1");
	}, function() {
		$(".icon-title.github").css("opacity", "0");
	});

	// To restart the game. Scores are preserved.
	$(".application-restart").on("click", function() {
		restartGame();
	});

	// To handle the game board's different squares being clicked on.
	$(".application-wrapper td").on("click", function() {
		// The application header has, by default, an active class. This is removed when the game ends, and added again when the user chooses to play again.
		if($(".application-header").hasClass("active")) {
			if($(this).text().trim() == "") {
				var player = $(".application-player").text().toLowerCase();
				// The square the user clicked on gets a "filled" class added to its class list. This keeps track of which squares have been filled.
				$(this).text(player).addClass("filled");
				light("set-power", "on");
				if(player == "x") {
					$(".application-player").text("o").attr("data-player", "o");
					light("set-color", "pink");
				}
				else {
					$(".application-player").text("x").attr("data-player", "x");
					light("set-color", "blue");
				}
				colorCells();
				checkWin(player);
			}
		}
	});

	// Settings functionality.
	$(".sections-wrapper.settings .section-submit").on("click", function() {
		var action = $(this).attr("data-action");
		var value = $(this).prev("input").val().trim();
		if(value != null && value != "") {
			if(action == "save-api-key") {
				window.localStorage.setItem("api-key", value);
				if(window.localStorage.getItem("api-key") != null) {
					notify("Saved", "The API Key has been saved.", "rgb(250,250,250)", 4000);
				}
				else {
					notify("Error", "Make sure your browser supports local storage.", "rgb(250,250,250)", 4000);
				}
			}
			else if(action == "save-bulb-ip") {
				// The "light()" function adds the "http://" and "/api/" part to the API endpoint URL, so they are removed if the user accidentally includes them.
				window.localStorage.setItem("bulb-ip", value.replace("http://", "").replace("/api/", ""));
				if(window.localStorage.getItem("bulb-ip") != null) {
					notify("Saved", "The Bulb IP has been saved.", "rgb(250,250,250)", 4000);
				}
				else {
					notify("Error", "Make sure your browser supports local storage.", "rgb(250,250,250)", 4000);
				}
			}
			else if(action == "save-bulb-id") {
				// The bulb ID is always an integer.
				if(Number.isInteger(value)) {
					window.localStorage.setItem("bulb-id", value);
					if(window.localStorage.getItem("bulb-id") != null) {
						notify("Saved", "The Bulb ID has been saved.", "rgb(250,250,250)", 4000);
					}
					else {
						notify("Error", "Make sure your browser supports local storage.", "rgb(250,250,250)", 4000);
					}
				}
				else {
					notify("Error", "The Bulb ID has to be a number.", "rgb(250,250,250)", 4000);
				}
			}
		}
		else {
			notify("Error", "Please fill out the input field.", "rgb(250,250,250)", 4000);
		}
	});

	function toggleMenu(override) {
		if($(".icon-wrapper.menu").hasClass("active") || override == "close") {
			$(".icon-wrapper.menu").removeClass("active");
			$(".menu-wrapper").css("width", "0");
			$(".body-wrapper").css("left", "0");
			setTimeout(function() {
				$(".body-wrapper").removeClass("extended");
			}, 250);
		}
		else {
			$(".icon-wrapper.menu").addClass("active");
			$(".menu-wrapper").css("width", "150px");
			$(".body-wrapper").css("left", "150px");
			// A timeout to wait for the animation to finish.
			setTimeout(function() {
				$(".body-wrapper").addClass("extended");
			}, 250);
		}
	}

	// Reset the game. Player scores aren't preserved.
	function resetGame() {
		restartGame();
		$(".application-score").html("0");
		notify("Reset", "The game has been reset.", "rgb(250,250,250)", 4000);
	}

	// Restarts the game. The player scores are preserved.
	function restartGame() {
		$(".application-wrapper td.filled").text("").removeClass("filled").removeAttr("style");
		$(".application-header").html('It\'s <span class="application-player">X</span>\'s Turn').addClass("active");
		$(".application-overlay").hide();
		light("set-power", "on");
		light("set-color", "blue");
	}

	// Light functions.
	function light(action, args) {
		// Default smart bulb IP, ID, and API key.
		var bulbIP = "http://192.168.0.50/api/";
		var bulbID = "13";
		var apiKey = "stlaB2I6VZ8O80Qepc-1xfmLrHgyTFvB9IGupaQz";

		// If the client's browser's local storage has entries for the IP, ID, or API key, then those are used instead of the default ones.
		if(window.localStorage.getItem("bulb-ip") != null) {
			bulbIP = "http://" + window.localStorage.getItem("bulb-ip") + "/api/";
		}
		if(window.localStorage.getItem("bulb-id") != null) {
			bulbID = window.localStorage.getItem("bulb-id");
		}
		if(window.localStorage.getItem("api-key") != null) {
			apiKey = window.localStorage.getItem("api-key");
		}

		var apiURL = bulbIP + apiKey + "/lights/" + bulbID + "/";

		// For changing the color of the smart bulb.
		if(action == "set-color") {
			if(args == "blue") {
				var color = 20010050;
			}
			else if(args == "pink") {
				var color = 29510050;
			}
			$.ajax({
				url:apiURL,
				type:"PUT",
				data:JSON.stringify({"hue":color}),
				success:function(data) {
					if(data != "" && data != null) {
						var response = JSON.parse(data);
					}
				},
				error:function(error) {
					console.log(error);
				}
			});
		}
		// For changing the power state of the light bulb.
		else if(action == "set-power") {
			$.ajax({
				url:apiURL,
				type:"GET",
				success:function(data) {
					if(data != null && data != "") {
						if(args == "off") {
							var power = false;
						}
						else if(args == "on") {
							var power = true;
						}
						$.ajax({
							url:apiURL,
							type:"PUT",
							data:JSON.stringify({"on":power}),
							success:function(data) {
								if(data != "" && data != null) {
									var response = JSON.parse(data);
								}
							},
							error:function(error) {
								console.log(error);
							}
						});
					}
				},
				error:function(error) {
					console.log(error);
				}
			});
		}
	}

	// Checks each cell or square on the board, and sets the font color to blue if it's an X, or pink if it's an O.
	function colorCells() {
		$.each($(".application-wrapper td"), function(index, cell) {
			if($(cell).text().toLowerCase() == "x") {
				$(cell).css("color", "#6186f6");
			}
			else {
				$(cell).css("color", "#dc529b");
			}
		});
	}

	// Checks rows, columns, and diagonal squares to determine if there's a winner.
	function checkWin(player) {
		var win = false;
		var color = "#c6ecff";

		if(player == "o") {
			color = "#ffc6e4";
		}

		var cells = $(".application-wrapper td");

		// Checks rows. There are 9 squares, and 3 rows, so with each loop, it is moving to the next row by incrementing the loop counter value by 3 each time (since there are 3 cells per row). In each row, there are 3 squares, so with each loop, the first cell would be the loop counter, the next one would be the counter incremented by one, and the third one would be the counter incremented by two.
		for(var i = 0; i < 9; i += 3) {
			if($(cells[i]).hasClass("filled") && $(cells[i]).text() == $(cells[i + 1]).text() && $(cells[i]).text() == $(cells[i + 2]).text()) {
				$(cells[i]).css("background", color);
				$(cells[i + 1]).css("background", color);
				$(cells[i + 2]).css("background", color);
				win = true;
			}
		}
		// Checks columns. There are 3 columns, and with each loop, the square below the first one is checked by incrementing the loop counter by 3 for the one below it, and 6 for the one below the second square in the column.
		for(var i = 0; i < 3; i++) {
			if($(cells[i]).hasClass("filled") && $(cells[i]).text() == $(cells[i + 3]).text() && $(cells[i]).text() == $(cells[i + 6]).text()) {
				$(cells[i]).css("background", color);
				$(cells[i + 3]).css("background", color);
				$(cells[i + 6]).css("background", color);
				win = true;
			}
		}
		// Checks diagonals.
		if($(cells[0]).hasClass("filled") && $(cells[0]).text() == $(cells[4]).text() && $(cells[0]).text() == $(cells[8]).text()) {
			$(cells[0]).css("background", color);
			$(cells[4]).css("background", color);
			$(cells[8]).css("background", color);
			win = true;
		}
		if($(cells[2]).hasClass("filled") && $(cells[2]).text() == $(cells[4]).text() && $(cells[2]).text() == $(cells[6]).text()) {
			$(cells[2]).css("background", color);
			$(cells[4]).css("background", color);
			$(cells[6]).css("background", color);
			win = true;
		}

		if(win) {
			$(".application-score." + player).html(parseInt($(".application-score." + player).html()) + 1);
			$(".application-header").html('<span class="application-player" data-player="' + player + '">' + player + '</span> Wins').removeClass("active");
			$(".application-overlay").show();
			light("set-power", "off");
		}
		else {
			// If all squres are filled, and no winner has been found, then the game must be over without any winners.
			if($(".filled").length == 9) {
				$(".application-header").text("Nobody Wins").removeClass("active");
				$(".application-overlay").show();
				light("set-power", "off");
			}
		}
	}

	// Notification function.
	function notify(title, description, color, duration) {
		// If the notification area element doesn't already exist, then one is added to the body.
		if($(".notification-area").length == 0) {
			$("body").append('<div class="notification-area"></div>');
		}
		var build = $('<div class="notification-wrapper noselect"><div class="notification-title-wrapper"><span class="notification-title">' + title + '</span></div><div class="notification-description-wrapper"><span class="notification-description">' + description + '</span></div></div>');
		// Add the notification card to the notification area.
		$(".notification-area").show().append(build);
		// Show the notification card, and animate its "right" property with a .4s animation from right to left.
		$(build).show().css({"right":"-600px", "background":color}).animate({right: 0}, 400);
		setTimeout(function() {
			// Hide the notification card after a custom duration.
			$(build).animate({right: -600}, 400);
			setTimeout(function() {
				// Remove the notification card.
				$(build).remove();
				// If there are no more notifications, hide the notification area completely.
				if($(".notification-area").html().length == 0) {
					$(".notification-area").hide();
				}
			}, 400);
		}, duration);
	}
});