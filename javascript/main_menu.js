"use strict";
//
/*
Steven Engler – 0524615
27 October 2016
CS 4471 – Computer Graphics
Lakehead University
*/
//
function MainMenu(gl, ctx){
	this.gl = gl
	this.ctx = ctx
	//
	this.start_game_button_bounding_box = {}
	this.start_game_button_bounding_box.left = this.ctx.canvas.width*0.31
	this.start_game_button_bounding_box.right = this.ctx.canvas.width*0.69
	this.start_game_button_bounding_box.top = this.ctx.canvas.height*0.5+25-35
	this.start_game_button_bounding_box.bottom = this.ctx.canvas.height*0.5-25-35
	//
	this.mouse_over_button = false
}
//
MainMenu.prototype.render = function(){
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	this.gl.enable(this.gl.BLEND);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	this.gl.clearColor(0.4, 0.45, 0.65, 1.0);
	//
	this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
	//
	var tmp_offset = -35
	//
	this.ctx.textAlign = "center";
	this.ctx.fillStyle = "#ffffff";
	this.ctx.font = "48px Verdana";
	this.ctx.lineWidth = 5;
	this.ctx.strokeStyle = "#113355";
	this.ctx.strokeText("Project 1", this.ctx.canvas.width/2.0, this.ctx.canvas.height/3.0+tmp_offset);
	this.ctx.fillText("Project 1", this.ctx.canvas.width/2.0, this.ctx.canvas.height/3.0+tmp_offset);
	//
	var box = this.start_game_button_bounding_box
	this.ctx.textAlign = "center";
	if(this.mouse_over_button){
		this.ctx.fillStyle = "#aaaaaa";
	}else{
		this.ctx.fillStyle = "#ffffff";
	}
	this.ctx.font = "26px Verdana";
	this.ctx.fillText("Start Game", (box.left+box.right)/2.0, (box.top+box.bottom)/2.0+10);
	//
	this.ctx.textAlign = "left";
	this.ctx.fillStyle = "#ffffff";
	this.ctx.font = "18px Verdana";
	var msg = ["Click the bacteria to remove them.", "Survive for 30 seconds to win.", "If the bacteria covers more than", "50% of the circle, you lose."]
	this.print_text(msg, 90, this.ctx.canvas.height*0.65+tmp_offset)
	//
	this.ctx.textAlign = "center";
	this.ctx.fillStyle = "#ffffff";
	this.ctx.font = "18px Verdana";
	this.ctx.fillText("COMP-4471, 2016", this.ctx.canvas.width/2.0, this.ctx.canvas.height*0.85);
	this.ctx.fillText("Steven Engler", this.ctx.canvas.width/2.0, this.ctx.canvas.height*0.91);
}
//
MainMenu.prototype.print_text = function(list_of_lines, start_x, start_y){
	for(var i=0; i<list_of_lines.length; i++){
		this.ctx.fillText(list_of_lines[i], start_x, start_y+25*i);
	}
}
//
MainMenu.prototype.check_if_point_in_box = function(x_pos, y_pos){
	return 	x_pos>this.start_game_button_bounding_box.left &&
			x_pos<this.start_game_button_bounding_box.right &&
			y_pos<this.start_game_button_bounding_box.top &&
			y_pos>this.start_game_button_bounding_box.bottom
}
//
MainMenu.prototype.click = function(x_pos, y_pos, width, height){
	if(this.check_if_point_in_box(x_pos, y_pos)){
		var gl = this.gl
		var ctx = this.ctx
		destroy_main_menu()
		setup_game_graphics(gl, ctx)
	}
}
//
MainMenu.prototype.mouse_move = function(x_pos, y_pos, width, height){
	if(this.check_if_point_in_box(x_pos, y_pos)){
		this.mouse_over_button = true
	}else{
		this.mouse_over_button = false
	}
}
