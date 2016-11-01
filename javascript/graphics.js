"use strict";
//
/*
Steven Engler – 0524615
27 October 2016
CS 4471 – Computer Graphics
Lakehead University
*/
//
function GameGraphics(gl, ctx){
	this.gl = gl
	this.ctx = ctx
	//
	this.game_start_time = Date.now()-start_time
	this.game_end_time = null
	this.game_over = false
	//
	this.program1 = initShaders(this.gl, "bacteria-vertex-shader", "fragment-shader")
	this.program2 = initShaders(this.gl, "circle-vertex-shader", "fragment-shader")
	this.program3 = initShaders(this.gl, "circle-vertex-shader", "fragment-shader")
	// we use three different programs to improve code readability at the slight expense of performance
	//
	///////////////////////////////////////////////////
	//
	this.gl.useProgram(this.program2)
	//
	this.large_circle = {}
	this.large_circle.default_color = [0.7, 0.0, 0.0, 1.0]
	this.large_circle.scale_loc = this.gl.getUniformLocation(this.program2, 'scale')
	this.large_circle.x_offset_loc = this.gl.getUniformLocation(this.program2, 'x_offset')
	this.large_circle.y_offset_loc = this.gl.getUniformLocation(this.program2, 'y_offset')
	this.large_circle.color_loc = this.gl.getUniformLocation(this.program2, 'color')
	this.large_circle.scale = 1.0
	this.large_circle.color = this.large_circle.default_color
	this.large_circle.darkness_factor = 0.0
	this.large_circle.vertices = this.build_circle(0, 0, 1.0, 40)
	this.large_circle.vertex_location = this.gl.getAttribLocation(this.program1, 'vPosition')
	this.large_circle.vertex_buffer = this.create_buffer(this.large_circle.vertices, this.large_circle.vertex_location, this.program2)
	//
	this.gl.uniform1f(this.large_circle.x_offset_loc, 0.0);
	this.gl.uniform1f(this.large_circle.y_offset_loc, 0.0);
	//
	///////////////////////////////////////////////////
	//
	this.gl.useProgram(this.program1)
	//
	this.bacteria_settings = {}
	this.bacteria_settings.bacteria = []
	this.bacteria_settings.scale_loc = this.gl.getUniformLocation(this.program1, 'scale')
	this.bacteria_settings.x_offset_loc = this.gl.getUniformLocation(this.program1, 'x_offset')
	this.bacteria_settings.y_offset_loc = this.gl.getUniformLocation(this.program1, 'y_offset')
	this.bacteria_settings.offset_scale_loc = this.gl.getUniformLocation(this.program1, 'offset_scale')
	this.bacteria_settings.color_loc = this.gl.getUniformLocation(this.program1, 'color')
	this.bacteria_settings.vertices = this.build_circle(0, 0, 1.0, 15)
	this.bacteria_settings.vertex_location = this.gl.getAttribLocation(this.program1, 'vPosition')
	this.bacteria_settings.vertex_buffer = this.create_buffer(this.bacteria_settings.vertices, this.bacteria_settings.vertex_location, this.program1)
	this.bacteria_settings.outer_circles = []
	//
	var num_outer_circles = 150
	for(var i=0; i<num_outer_circles; i++){
		var angle = (i/num_outer_circles)*2*Math.PI
		var rad_factor = (Math.sin(15*angle)/2+0.5)/40.0+0.99
		this.bacteria_settings.outer_circles.push(this.build_bacteria(rad_factor*game_inner_circle_radius*Math.cos(angle), rad_factor*game_inner_circle_radius*Math.sin(angle), this.large_circle.default_color))
	}
	//
	///////////////////////////////////////////////////
	//
	this.gl.useProgram(this.program3);
	//
	this.particle_settings = {}
	this.particle_settings.scale_loc = this.gl.getUniformLocation(this.program3, 'scale')
	this.particle_settings.x_offset_loc = this.gl.getUniformLocation(this.program3, 'x_offset')
	this.particle_settings.y_offset_loc = this.gl.getUniformLocation(this.program3, 'y_offset')
	this.particle_settings.color_loc = this.gl.getUniformLocation(this.program3, 'color')
	//this.particle_settings.radius_range = [0.008, 0.015]
	//this.particle_settings.speed_range = [1.0, 4.0]
	this.particle_settings.radius_range = [0.008, 0.013]
	this.particle_settings.speed_range = [0.5, 2.0]
	this.particle_settings.particles = []
	this.particle_settings.vertices = this.build_circle(0, 0, 1.0, 6)
	this.particle_settings.vertex_location = this.gl.getAttribLocation(this.program3, 'vPosition')
	this.particle_settings.vertex_buffer = this.create_buffer(this.particle_settings.vertices, this.particle_settings.vertex_location, this.program3)
	//
	///////////////////////////////////////////////////
	//
	reset_game()
}
//
GameGraphics.prototype.add_particle = function(start_x_pos, start_y_pos, create_time, delay_time){
	var p = {}
	p.x = start_x_pos
	p.y = start_y_pos
	p.create_time = create_time
	p.delay_time = delay_time
	p.radius = Math.random()*(this.particle_settings.radius_range[1]-this.particle_settings.radius_range[0])+this.particle_settings.radius_range[0]
	var speed = Math.random()*(this.particle_settings.speed_range[1]-this.particle_settings.speed_range[0])+this.particle_settings.speed_range[0]
	var angle = Math.random()*2*Math.PI
	p.x_speed = speed*Math.cos(angle)
	p.y_speed = speed*Math.sin(angle)
	p.lifespan = 0.3 //seconds
	p.color = [Math.random()*0.8, Math.random()*0.8, Math.random()*0.8, 1.0]
	//
	this.particle_settings.particles.push(p)
}
//
GameGraphics.prototype.build_bacteria = function(x_pos, y_pos, color, radius){
	var new_bacteria = {}
	new_bacteria.x = x_pos
	new_bacteria.y = y_pos
	new_bacteria.color = duplicate_array(color)
	new_bacteria.change_to_color = null
	new_bacteria.change_to_color_total_time = null
	new_bacteria.change_to_color_start_time = null
	new_bacteria.change_to_color_start_delay = null
	//
	new_bacteria.scale_2 = 0.0
	new_bacteria.scale = 1.0
	new_bacteria.scale_period_offset = Math.random()*2.0*Math.PI
	if(arguments.length == 4){
		new_bacteria.radius = radius
	}else{
		new_bacteria.radius = 0.03*(1+Math.random()*0.6-0.3)
	}
	//
	return new_bacteria
}
//
GameGraphics.prototype.add_bacteria = function(new_bacteria){
	this.bacteria_settings.bacteria.push(new_bacteria)
}
//
GameGraphics.prototype.build_circle = function(x_pos, y_pos, radius, num_of_edges){
	var circle_vertices = [vec2(x_pos,y_pos)];
	//
	for(var i=0; i<=num_of_edges; i++){
		// need to repeat the first vertex once
		var angle = (i/(num_of_edges/360.0))/180.0*Math.PI;
		circle_vertices.push(vec2(radius*Math.cos(angle)+x_pos, radius*Math.sin(angle)+y_pos));
	}
	return circle_vertices;
}
//
GameGraphics.prototype.create_empty_buffer = function(size, attr_loc, program){
	var buffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, size, this.gl.STATIC_DRAW);
	//
    this.gl.vertexAttribPointer(attr_loc, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(attr_loc);
	//
	return buffer;
	// to add to buffer: this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 8*index, flatten(t1));
}
//
GameGraphics.prototype.create_buffer = function(data, attr_loc, program){
	var bufferId = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferId);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(data), this.gl.STATIC_DRAW);
	//
    this.gl.vertexAttribPointer(attr_loc, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(attr_loc);
	//
	return bufferId;
}
//
GameGraphics.prototype.draw_bacteria = function(){
	for(var i=0; i<this.bacteria_settings.bacteria.length; i++){//1.3*
		this.gl.uniform1f(this.bacteria_settings.scale_loc, 0.011+this.bacteria_settings.bacteria[i].radius*this.bacteria_settings.bacteria[i].scale*this.bacteria_settings.bacteria[i].scale_2);
		this.gl.uniform1f(this.bacteria_settings.x_offset_loc, this.bacteria_settings.bacteria[i].x);
		this.gl.uniform1f(this.bacteria_settings.y_offset_loc, this.bacteria_settings.bacteria[i].y);
		this.gl.uniform1f(this.bacteria_settings.offset_scale_loc, this.large_circle.scale);
		var c = this.bacteria_settings.bacteria[i].color
		this.gl.uniform4f(this.bacteria_settings.color_loc, c[0]*0.5, c[1]*0.5, c[2]*0.5, c[3]);
		this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.bacteria_settings.vertices.length);
	}
	//
	for(var i=0; i<this.bacteria_settings.bacteria.length; i++){
		this.gl.uniform1f(this.bacteria_settings.scale_loc, this.bacteria_settings.bacteria[i].radius*this.bacteria_settings.bacteria[i].scale*this.bacteria_settings.bacteria[i].scale_2);
		this.gl.uniform1f(this.bacteria_settings.x_offset_loc, this.bacteria_settings.bacteria[i].x);
		this.gl.uniform1f(this.bacteria_settings.y_offset_loc, this.bacteria_settings.bacteria[i].y);
		this.gl.uniform1f(this.bacteria_settings.offset_scale_loc, this.large_circle.scale);
		var c = this.bacteria_settings.bacteria[i].color
		this.gl.uniform4f(this.bacteria_settings.color_loc, c[0], c[1], c[2], c[3]);
		this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.bacteria_settings.vertices.length);
	}
}
//
GameGraphics.prototype.difficulty_curve = function(x){
	// goes through origin (0,0) and reaches y=0.5 at roughly 3.25
	// at x=5 it as nearly at most difficult
	return (Math.atan(x-3.078)/Math.PI+0.4)/0.9
}
//
GameGraphics.prototype.animate = function(time_since_start, time_since_last_update){
	var gameplay_time_elapsed = time_since_start-this.game_start_time
	//
	for(var i=0; i<this.bacteria_settings.bacteria.length; i++){
		var this_bacteria = this.bacteria_settings.bacteria[i]
		this_bacteria.scale = 1+0.2*Math.sin(4*time_since_start/1000.0+this_bacteria.scale_period_offset)
		var c = this_bacteria.color
		if(c[3] < 1){
			c[3] += 0.5*time_since_last_update/1000;
		}
		if(c[3] > 1){
			c[3] = 1
		}
		if(this_bacteria.scale_2 < 1){
			this_bacteria.scale_2 += 0.5*time_since_last_update/1000;
		}
		if(this_bacteria.scale_2 > 1){
			this_bacteria.scale_2 = 1
		}
		//
		if(this_bacteria.change_to_color != null){
			var curr_time = Date.now()
			if(curr_time > this_bacteria.change_to_color_start_time){
				var fraction = (curr_time-this_bacteria.change_to_color_start_time)/this_bacteria.change_to_color_total_time
				if(fraction <= 1){
					for(var j=0; j<c.length; j++){
						c[j] += (this_bacteria.change_to_color[j]-c[j])*fraction*0.5
					}
				}else{
					for(var j=0; j<c.length; j++){
						c[j] = this_bacteria.change_to_color[j]
					}
					if(this_bacteria.change_to_color_delete_at_end){
						this.bacteria_settings.bacteria.splice(i, 1)
						i--
					}
					this_bacteria.change_to_color = null
					this_bacteria.change_to_color_total_time = null
					this_bacteria.change_to_color_start_time = null
					this_bacteria.change_to_color_delete_at_end = null
				}
			}
		}
	}
	//
	for(var i=0; i<this.bacteria_settings.outer_circles.length; i++){
		this.bacteria_settings.outer_circles[i].scale = 1+0.2*Math.sin(4*time_since_start/1000.0+this.bacteria_settings.outer_circles[i].scale_period_offset)
	}
	//
	for(var i=0; i<this.particle_settings.particles.length; i++){
		var p = this.particle_settings.particles[i]
		if(time_since_start > p.create_time+p.delay_time+p.lifespan*1000.0){
			this.particle_settings.particles.splice(i, 1)
			i--
		}
	}
	//
	//this.large_circle.scale = 1+0.3*this.difficulty_curve((time_since_start/1000.0)/6)*Math.sin(2*time_since_start/1000.0)
	this.large_circle.scale = 1+0.1*this.difficulty_curve((gameplay_time_elapsed/1000.0)/6)*Math.sin(2*gameplay_time_elapsed/1000.0)
	// the scale will go +- 10% and will reach max difficulty around 6*5=30 seconds
}
//
GameGraphics.prototype.get_time_remaining = function(){
	return (time_length_of_game-((Date.now()-start_time)-this.game_start_time))
}
//
GameGraphics.prototype.render = function(){
	var curr_time = Date.now()
	var time_since_start = curr_time-start_time
	//
    //this.gl.clear(this.gl.COLOR_BUFFER_BIT)
	//this.gl.enable( this.gl.DEPTH_TEST );
	//
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	// this allows us to blend colors with alpha transparency
	// depth test cannot be used in this situation
	this.gl.enable(this.gl.BLEND);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	//
	this.gl.clearColor(0.4, 0.45, 0.65, 1.0);
	//
	this.gl.useProgram(this.program1);
    //
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bacteria_settings.vertex_buffer);
	this.gl.enableVertexAttribArray(this.bacteria_settings.vertex_location);
	this.gl.vertexAttribPointer(this.bacteria_settings.vertex_location, 2, this.gl.FLOAT, false, 0, 0);
	//
	for(var i=0; i<this.bacteria_settings.outer_circles.length; i++){
		var b = this.bacteria_settings.outer_circles[i]
		//
		this.gl.uniform1f(this.bacteria_settings.scale_loc, b.radius*b.scale+0.015);//1.45
		this.gl.uniform1f(this.bacteria_settings.x_offset_loc, b.x);
		this.gl.uniform1f(this.bacteria_settings.y_offset_loc, b.y);
		this.gl.uniform1f(this.bacteria_settings.offset_scale_loc, this.large_circle.scale);
		this.gl.uniform4f(this.bacteria_settings.color_loc, 0.4, 0.0, 0.0, 1.0);
		this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.bacteria_settings.vertices.length);
	}
	//
	this.gl.useProgram(this.program2);
    //
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.large_circle.vertex_buffer);
	this.gl.enableVertexAttribArray(this.large_circle.vertex_location);
	this.gl.vertexAttribPointer(this.large_circle.vertex_location, 2, this.gl.FLOAT, false, 0, 0);
	//
	this.gl.uniform1f(this.large_circle.scale_loc, game_inner_circle_radius*this.large_circle.scale);
	var color = this.large_circle.color;
	this.gl.uniform4f(this.large_circle.color_loc, color[0]*(1-this.large_circle.darkness_factor), color[1]*(1-this.large_circle.darkness_factor), color[2]*(1-this.large_circle.darkness_factor), color[3]);
	this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.large_circle.vertices.length);
	//
	this.gl.useProgram(this.program1);
    //
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bacteria_settings.vertex_buffer);
	this.gl.enableVertexAttribArray(this.bacteria_settings.vertex_location);
	this.gl.vertexAttribPointer(this.bacteria_settings.vertex_location, 2, this.gl.FLOAT, false, 0, 0);
	//
	for(var i=0; i<this.bacteria_settings.outer_circles.length; i++){
		var b = this.bacteria_settings.outer_circles[i]
		//
		this.gl.uniform1f(this.bacteria_settings.scale_loc, b.radius*b.scale);
		this.gl.uniform1f(this.bacteria_settings.x_offset_loc, b.x);
		this.gl.uniform1f(this.bacteria_settings.y_offset_loc, b.y);
		this.gl.uniform1f(this.bacteria_settings.offset_scale_loc, this.large_circle.scale);
		this.gl.uniform4f(this.bacteria_settings.color_loc, b.color[0]*(1-this.large_circle.darkness_factor), b.color[1]*(1-this.large_circle.darkness_factor), b.color[2]*(1-this.large_circle.darkness_factor), b.color[3]);
		this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.bacteria_settings.vertices.length);
	}
	this.draw_bacteria()
	//
	this.gl.useProgram(this.program3);
    //
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particle_settings.vertex_buffer);
	this.gl.enableVertexAttribArray(this.particle_settings.vertex_location);
	this.gl.vertexAttribPointer(this.particle_settings.vertex_location, 2, this.gl.FLOAT, false, 0, 0);
	//
	for(var i=0; i<this.particle_settings.particles.length; i++){
		var p = this.particle_settings.particles[i]
		//
		if(time_since_start-p.create_time > p.delay_time){
			this.gl.uniform1f(this.particle_settings.scale_loc, p.radius);
			this.gl.uniform1f(this.particle_settings.x_offset_loc, p.x+p.x_speed*(time_since_start-p.create_time-p.delay_time)/1000.0);
			this.gl.uniform1f(this.particle_settings.y_offset_loc, p.y+p.y_speed*(time_since_start-p.create_time-p.delay_time)/1000.0);
			//this.gl.uniform1f(this.particle_settings.x_offset_loc, 0.0);
			//this.gl.uniform1f(this.particle_settings.y_offset_loc, p.y_speed/100);
			this.gl.uniform1f(this.particle_settings.offset_scale_loc, this.large_circle.scale);
			//
			this.gl.uniform4f(this.particle_settings.color_loc, p.color[0], p.color[1], p.color[2], p.color[3]*(1.0-((time_since_start-p.create_time-p.delay_time)/1000.0)/p.lifespan));
			this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.particle_settings.vertices.length);
		}
	}
	//
	// DRAW TEXT
	//
	this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
	//
	
	if(this.game_over){
		var time_remaining = (time_length_of_game-(this.game_end_time-this.game_start_time))/1000.0
	}else{
		var time_remaining = this.get_time_remaining()/1000.0
	}
	//
	if(this.game_over && Date.now()-start_time-this.game_end_time > 1500){
		this.ctx.textAlign = "center";
		this.ctx.fillStyle = "#ffffff";
		this.ctx.font = "18px Verdana";
		this.ctx.fillText('Click to continue...', this.ctx.canvas.width/2.0, this.ctx.canvas.height*0.6);
	}
	//
	if(time_remaining < 0){
		time_remaining = 0
	}
	this.ctx.textAlign = "left";
	this.ctx.fillStyle = "#ffffff";
	this.ctx.font = "18px Verdana";
	this.ctx.lineWidth = 3;
	this.ctx.strokeText('Time remaining: '+(time_remaining).toFixed(1), 10, 30);
	this.ctx.fillText('Time remaining: '+(time_remaining).toFixed(1), 10, 30);
	//
	if(time_remaining == 0){
		this.ctx.textAlign = "center";
		this.ctx.fillStyle = "#ffffff";
		this.ctx.font = "24px Verdana";
		this.ctx.lineWidth = 4;
		this.ctx.strokeText('You won!', this.ctx.canvas.width/2.0, this.ctx.canvas.height/2.0);
		this.ctx.fillText('You won!', this.ctx.canvas.width/2.0, this.ctx.canvas.height/2.0);
	}else if(this.game_over){
		this.ctx.textAlign = "center";
		this.ctx.fillStyle = "#ffffff";
		this.ctx.font = "24px Verdana";
		this.ctx.lineWidth = 4;
		this.ctx.strokeText('You lost!', this.ctx.canvas.width/2.0, this.ctx.canvas.height/2.0);
		this.ctx.fillText('You lost!', this.ctx.canvas.width/2.0, this.ctx.canvas.height/2.0);
	}
}