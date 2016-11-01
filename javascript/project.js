"use strict";
//
/*
Steven Engler – 0524615
27 October 2016
CS 4471 – Computer Graphics
Lakehead University
*/
//
var gl_canvas;
var text_canvas;
var text_ctx;
var gl;
var state = null;
// the state of the application (such as which menu/screen it's on)
//
var start_time = Date.now()
var last_update_time = 0
// allows the game logic to be time-based rather than frame based
//
var current_game_graphics;
var main_menu;
//
function setup_main_menu(gl, ctx){
	main_menu = new MainMenu(gl, ctx)
	state = 'main_menu'
}
function destroy_main_menu(){
	state = null
	main_menu = null
}
//
function setup_game_graphics(gl, ctx){
	current_game_graphics = new GameGraphics(gl, ctx)
	state = 'game'
}
function destroy_game_graphics(){
	state = null
	current_game_graphics = null
}
//
window.onload = function(){
    gl_canvas = document.getElementById("gl-canvas");
	text_canvas = document.getElementById("text-canvas")
	text_ctx = text_canvas.getContext("2d");
	//
    gl = WebGLUtils.setupWebGL(gl_canvas, { alpha: false });//, { premultipliedAlpha: false }
    if(!gl){
		alert("WebGL isn't available.");
	}
	//
    gl.viewport(0, 0, gl_canvas.width, gl_canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
	//
	setup_main_menu(gl, text_ctx)
	// load the main menu at the beginning
	//
	text_canvas.addEventListener("click", function(){
		var rect = text_canvas.getBoundingClientRect()
		var x_pos = event.clientX-rect.left
		var y_pos = event.clientY-rect.top
		// found the correct click location
		//
		process_mouse_click(x_pos, y_pos, rect.width, rect.height)
	});
	text_canvas.addEventListener("mousemove", function(){
		var rect = text_canvas.getBoundingClientRect()
		var x_pos = event.clientX-rect.left
		var y_pos = event.clientY-rect.top
		// found the correct click location
		//
		process_mouse_move(x_pos, y_pos, rect.width, rect.height)
	});
	//
	setInterval(update, 1000/30);
	// update the animation data roughly 30 times a second
    render();
};
//
function process_mouse_click(x_pos, y_pos, width, height){
	if(state == 'game'){
		game_mouse_click(x_pos, y_pos, width, height)
	}else if(state == 'main_menu'){
		main_menu.click(x_pos, y_pos, width, height)
	}
}
//
function process_mouse_move(x_pos, y_pos, width, height){
	if(state == 'game'){
		// game doesn't care about mouse movement
	}else if(state == 'main_menu'){
		main_menu.mouse_move(x_pos, y_pos, width, height)
	}
}
//
function update(){
	var curr_time = Date.now()
	var time_since_start = curr_time-start_time
	//
	if(state == 'game'){
		gameLoop(time_since_start, time_since_start-last_update_time)
		current_game_graphics.animate(time_since_start, time_since_start-last_update_time)
	}else if(state == 'main_menu'){
		// main menu doesn't have an animation
	}
	//
	last_update_time = curr_time-start_time
}
//
function render(){
	if(state == 'game'){
		current_game_graphics.render()
	}else if(state == 'main_menu'){
		main_menu.render()
	}
	window.requestAnimFrame(render)
}
