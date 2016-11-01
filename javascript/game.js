"use strict";
//
/*
Steven Engler – 0524615
27 October 2016
CS 4471 – Computer Graphics
Lakehead University
*/
//
var bacteria_parts
// the non-gui bacteria (for game logic, not drawing)
//
var time_for_next_bacteria
var game_circle_radius = 0.8
var game_inner_circle_radius = game_circle_radius*0.94
var time_length_of_game = 30.0*1000
//
var bacteria_colors = [
						[0.6, 0.3, 0.1, 1.0],
						[0.0, 1.0, 0.0, 1.0],
						[0.0, 0.0, 1.0, 1.0],
						[1.0, 1.0, 0.0, 1.0],
						[1.0, 0.0, 1.0, 1.0],
						[0.0, 1.0, 1.0, 1.0],
						[0.5, 0.5, 0.5, 1.0],
					  ]
for(var ijkl=0; ijkl<bacteria_colors.length; ijkl++){
	for(var abcd=0; abcd<3; abcd++){
		bacteria_colors[ijkl][abcd] *= 0.75
		// make the colors darker (but not alpha)
	}
}
//
function reset_game(){
	bacteria_parts = []
	time_for_next_bacteria = 1000
}
//
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}
//
function add_graphics_bacteria(bacteria_game, bacteria_graphic){
	bacteria_game.graphics.push(bacteria_graphic)
	current_game_graphics.add_bacteria(bacteria_graphic)
}
//
function array_difference(A, B){
	// returns A\B
	return A.filter(x => B.indexOf(x) < 0);
}
//
function integer_list(num){
	// returns an integer list from 0 to num (not including num) with spacing 1
	var list = []
	for(var i=0; i<num; i++){
		list.push(i)
	}
	return list
}
//
function order_bacteria_by_angle(bacteria_list, lower_angle){
	// modifies the array in place
	//var angles = []
	for(var i=0; i<bacteria_list.length; i++){
		var bacteria_angle = Math.atan2(bacteria_list[i].y, bacteria_list[i].x)*(180/Math.PI)
		// first, get check_angle between lower_angle and lower_angle+360
		while(bacteria_angle>=lower_angle+360){
			bacteria_angle -= 360
		}
		while(bacteria_angle<lower_angle){
			bacteria_angle += 360
		}
		bacteria_list[i].__temp_angle__ = bacteria_angle
		//angles.push(bacteria_angle)
	}
	//
	bacteria_list.sort(function(a, b){return a.__temp_angle__-b.__temp_angle__})
	//
	for(var i=0; i<bacteria_list.length; i++){
		delete bacteria_list[i].__temp_angle__
	}
}
//
function destroy_bacteria_part(this_bacteria, angle){
	var data = split_bacteria_by_angle(this_bacteria.graphics, angle, this_bacteria.left_angle)
	var less = data[0]
	var more = data[1]
	//
	order_bacteria_by_angle(less, this_bacteria.left_angle)
	order_bacteria_by_angle(more, this_bacteria.left_angle)
	less.reverse()
	//
	var speed = (1000.0/60.0)*(60.0/this_bacteria.graphics.length)
	// 60 per second for a length of 60 bacteria
	//
	for(var t=0; t<less.length; t++){
		less[t].change_to_color = [this_bacteria.color[0], this_bacteria.color[1], this_bacteria.color[2], 0.0]
		less[t].change_to_color_total_time = 500
		less[t].change_to_color_start_time = Date.now()+speed*t
		less[t].change_to_color_delete_at_end = true
		//
		for(var j=0; j<15; j++){
			current_game_graphics.add_particle(less[t].x, less[t].y, Date.now()-start_time, speed*t)
		}
	}
	//
	for(var t=0; t<more.length; t++){
		more[t].change_to_color = [this_bacteria.color[0], this_bacteria.color[1], this_bacteria.color[2], 0.0]
		more[t].change_to_color_total_time = 500
		more[t].change_to_color_start_time = Date.now()+speed*t
		more[t].change_to_color_delete_at_end = true
		//
		for(var j=0; j<15; j++){
			current_game_graphics.add_particle(more[t].x, more[t].y, Date.now()-start_time, speed*t)
		}
	}
}
//
function game_mouse_click(xPos, yPos, canvas_width, canvas_height){
	if(current_game_graphics.game_over){
		if(current_game_graphics.game_over && Date.now()-start_time-current_game_graphics.game_end_time > 1500){
		//if(current_game_graphics.get_time_remaining() < -1500){
			var gl = current_game_graphics.gl
			var ctx = current_game_graphics.ctx
			destroy_game_graphics()
			setup_main_menu(gl, ctx)
		}
		return
	}
	var bacteria_inner_radius = current_game_graphics.large_circle.scale*game_circle_radius-0.05
	var bacteria_outer_radius = current_game_graphics.large_circle.scale*game_circle_radius+0.05
	//
	xPos = 2.0*(xPos/canvas_width)-1.0
	yPos = 2.0*(yPos/canvas_height)-1.0
	yPos *= -1
	var radPosition = Math.sqrt(xPos*xPos+yPos*yPos)
	//
	var angle = Math.atan2(yPos, xPos)*(180/Math.PI)
	//
	var hit = false;
	//
	for(var i=0; i<bacteria_parts.length; i++){
		var this_bacteria = bacteria_parts[i]
		//
		if(radPosition > bacteria_inner_radius && radPosition < bacteria_outer_radius){
			if(check_intersection(angle, this_bacteria.left_angle, this_bacteria.left_angle+this_bacteria.arc_angle)){
				bacteria_parts.splice(i, 1)
				i--
				hit = true
				//
				destroy_bacteria_part(this_bacteria, angle)
			}
		}
	}
	//
	if(hit){
		if(Math.random()>0.5){
			var audio = new Audio('audio/splat1.mp3');
			audio.play();
		}else{
			var audio = new Audio('audio/splat2.mp3');
			audio.play();
		}
	}
}
//
function add_new_bacteria(angle){
	var b = {}
	//b.angle = angle
	//b.arc_angle = 10*(Math.PI/180)
	b.time_created = Date.now()
	b.left_angle = angle
	b.arc_angle = 0
	b.grow_speed = 7+(Math.random()*2-1)//2+(Math.random()*2-1)
	// deg/S
	b.num_of_merges = 0
	//
	var colors_used = []
	for(var i=0; i<bacteria_parts.length; i++){
		colors_used.push(bacteria_parts[i].color_index)
	}
	var temp_list = integer_list(bacteria_colors.length)
	var colors_unused = array_difference(temp_list, colors_used)
	//
	if(colors_unused.length == 0){
		// no colors left
		b.color_index = null
		b.color = [Math.random(), Math.random(), Math.random(), 1.0]
	}else{
		b.color_index = colors_unused[Math.floor(Math.random()*colors_unused.length)]
		b.color = bacteria_colors[b.color_index]
	}
	var temp_color = [b.color[0], b.color[1], b.color[2], 0.0]
	b.graphics = []
	add_graphics_bacteria(b, current_game_graphics.build_bacteria(game_circle_radius*Math.cos(angle*(Math.PI/180)), game_circle_radius*Math.sin(angle*(Math.PI/180)), temp_color))
	//
	bacteria_parts.push(b)
}
//
function split_bacteria_by_angle(bacteria_list, check_angle, lower_angle){
	// angles in degrees
	// first, get check_angle between lower_angle and lower_angle+360
	while(check_angle>=lower_angle+360){
		check_angle -= 360
	}
	while(check_angle<lower_angle){
		check_angle += 360
	}
	//
	var less = []
	var more = []
	//
	for(var i=0; i<bacteria_list.length; i++){
		var bacteria_angle = Math.atan2(bacteria_list[i].y, bacteria_list[i].x)*(180/Math.PI)
		// first, get bacteria_angle between lower_angle and lower_angle+360
		while(bacteria_angle>=lower_angle+360){
			bacteria_angle -= 360
		}
		while(bacteria_angle<lower_angle){
			bacteria_angle += 360
		}
		if(bacteria_angle < check_angle){
			less.push(bacteria_list[i])
		}else{
			more.push(bacteria_list[i])
		}
	}
	return [less, more]
}
//
function check_intersection(check_angle, lower_angle, higher_angle){
	// angles in degrees
	// first, get check_angle between lower_angle and lower_angle+360
	while(check_angle>=lower_angle+360){
		check_angle -= 360
	}
	while(check_angle<lower_angle){
		check_angle += 360
	}
	//
	if(check_angle < higher_angle){
		return true
	}
	return false
}
//
function normalizeAngle(angle){
    return ((angle%360)+360)%360;
}
//
function getBoundingAngles(min_angle_1, min_angle_2, arc_angle_1, arc_angle_2){
	// in order to simplify the math, this function returns an approximation
	//
	assert(arc_angle_1 > 0, 'Error with angles (1).')
	assert(arc_angle_2 > 0, 'Error with angles (2).')
	//
	min_angle_1 = normalizeAngle(Math.floor(min_angle_1))
	min_angle_2 = normalizeAngle(Math.floor(min_angle_2))
	arc_angle_1 = Math.ceil(arc_angle_1)
	arc_angle_2 = Math.ceil(arc_angle_2)
	//
	var angles = []
	for(var i=0; i<360; i++){
		angles.push(false)
	}
	//
	for(var i=0; i<arc_angle_1; i++){
		angles[(min_angle_1+i)%angles.length] = true
	}
	for(var i=0; i<arc_angle_2; i++){
		angles[(min_angle_2+i)%angles.length] = true
	}
	//
	var last_state = true
	var start_index = 0
	while(!(angles[start_index%angles.length] && last_state == false)){
		last_state = angles[start_index%angles.length]
		start_index++
		if(start_index>370){
			assert(false, 'something went wrong')
		}
	}
	start_index = start_index%angles.length
	//
	var count = 0
	for(var i=0; i<angles.length; i++){
		if(angles[i]){
			count++
		}
	}
	assert(count >= arc_angle_1)
	assert(count >= arc_angle_2)
	//
	//console.log([arc_angle_1, arc_angle_2, count])
	return [start_index, start_index+count]
}
//
function combine_bacteria(b1, b2){
	// b1 was created earlier (is older), so it will consume b2
	//
	var bounding_angles = getBoundingAngles(b1.left_angle, b2.left_angle, b1.arc_angle, b2.arc_angle)
	b1.left_angle = bounding_angles[0]+1
	b1.arc_angle = bounding_angles[1]-bounding_angles[0]-2
	//
	b1.graphics = b1.graphics.concat(b2.graphics)
	//
	for(var i=0; i<b1.graphics.length; i++){
		b1.graphics[i].change_to_color = b1.color
		b1.graphics[i].change_to_color_total_time = 4000
		b1.graphics[i].change_to_color_start_time = Date.now()
		b1.graphics[i].change_to_color_delete_at_end = false
	}
	//
	b1.num_of_merges++
}
//
function check_if_angle_used(angle){
	// angle in degrees
	for(var i=0; i<bacteria_parts.length; i++){
		if(check_intersection(angle, bacteria_parts[i].left_angle, bacteria_parts[i].left_angle+bacteria_parts[i].arc_angle)){
			return true
		}
	}
	return false
}
//
function gameLoop(time_since_start, time_since_last_update){
	if(current_game_graphics.game_over){
		return
	}
	if(current_game_graphics.get_time_remaining() <= 0){
		current_game_graphics.game_over = true
		current_game_graphics.game_end_time = Date.now()-start_time
		for(var i=0; i<bacteria_parts.length; i++){
			var angle = bacteria_parts[i].left_angle+bacteria_parts[i].arc_angle/2.0
			destroy_bacteria_part(bacteria_parts[i], angle)
		}
		return
	}
	//
	var gameplay_time_elapsed = time_since_start-current_game_graphics.game_start_time
	//
	if(gameplay_time_elapsed > time_for_next_bacteria){
		//time_for_next_bacteria += 1000//Math.random()*10*1000
		time_for_next_bacteria += Math.random()*1.5*1000*(1-0.5*current_game_graphics.difficulty_curve((gameplay_time_elapsed/1000.0)/4))
		//if(bacteria_parts.length <= 1){
		var found_angle = false
		var angle = null
		for(var i=0; i<40; i++){
			// only try a max of 40 times
			angle = Math.random()*360
			if(!check_if_angle_used(angle)){
				found_angle = true
				break
			}
		}
		if(found_angle){
			add_new_bacteria(angle)
		}
		//}
	}
	//
	var total_arc_angle = 0
	for(var i=0; i<bacteria_parts.length; i++){
		bacteria_parts[i].left_angle -= bacteria_parts[i].grow_speed*(time_since_last_update/1000.0)/2.0
		bacteria_parts[i].arc_angle += bacteria_parts[i].grow_speed*(time_since_last_update/1000.0)
		var arc_angle = bacteria_parts[i].arc_angle
		var center_angle = bacteria_parts[i].left_angle+arc_angle/2.0
		//
		total_arc_angle += arc_angle
		//
		var angle_step = 2.0
		var num_added = (bacteria_parts[i].graphics.length-1)/2-2*bacteria_parts[i].num_of_merges
		var num_to_add = (arc_angle/2.0)/angle_step - num_added
		for(var j=0; j<num_to_add; j++){
			var color = [bacteria_parts[i].color[0], bacteria_parts[i].color[1], bacteria_parts[i].color[2], 0.0]
			//
			var temp_angle = (center_angle+(num_added+j+1)*angle_step)*(Math.PI/180.0)
			var b = current_game_graphics.build_bacteria(game_circle_radius*Math.cos(temp_angle), game_circle_radius*Math.sin(temp_angle), color)
			add_graphics_bacteria(bacteria_parts[i], b)
			//
			var temp_angle = (center_angle-(num_added+j+1)*angle_step)*(Math.PI/180.0)
			var b = current_game_graphics.build_bacteria(game_circle_radius*Math.cos(temp_angle), game_circle_radius*Math.sin(temp_angle), color)
			add_graphics_bacteria(bacteria_parts[i], b)
		}
	}
	if(total_arc_angle>180){
		current_game_graphics.game_over = true
		current_game_graphics.game_end_time = Date.now()-start_time
	}
	//large_circle.darkness_factor = Math.min(0.4, total_arc_angle/360.0)
	//file:///C:/Users/Steven/Dropbox/Documents/Miscellaneous%20Documents/School/Lakehead/Computers%204471%20-%20Computer%20Graphics/Project%201/project.html
	for(var i=0; i<bacteria_parts.length; i++){
		for(var j=i+1; j<bacteria_parts.length; j++){
			var intersects_1 = check_intersection(bacteria_parts[i].left_angle, 							bacteria_parts[j].left_angle, bacteria_parts[j].left_angle+bacteria_parts[j].arc_angle)
			var intersects_2 = check_intersection(bacteria_parts[i].left_angle+bacteria_parts[i].arc_angle, bacteria_parts[j].left_angle, bacteria_parts[j].left_angle+bacteria_parts[j].arc_angle)
			var intersects_3 = check_intersection(bacteria_parts[j].left_angle, 							bacteria_parts[i].left_angle, bacteria_parts[i].left_angle+bacteria_parts[i].arc_angle)
			var intersects_4 = check_intersection(bacteria_parts[j].left_angle+bacteria_parts[j].arc_angle, bacteria_parts[i].left_angle, bacteria_parts[i].left_angle+bacteria_parts[i].arc_angle)
			//
			if(intersects_1 && intersects_2){
				for(var t=0; t<bacteria_parts[i].graphics.length; t++){
					current_game_graphics.bacteria_settings.bacteria.splice(current_game_graphics.bacteria_settings.bacteria.indexOf(bacteria_parts[i].graphics[t]), 1)
				}
				bacteria_parts.splice(i, 1)
				j=999999
				i--
			}else if(intersects_3 && intersects_4){
				for(var t=0; t<bacteria_parts[j].graphics.length; t++){
					current_game_graphics.bacteria_settings.bacteria.splice(current_game_graphics.bacteria_settings.bacteria.indexOf(bacteria_parts[j].graphics[t]), 1)
				}
				bacteria_parts.splice(j, 1)
				j--
			}else if(intersects_1 || intersects_2 || intersects_3 || intersects_4){
				var b1 = bacteria_parts[i]
				var b2 = bacteria_parts[j]
				var swapped = false
				//
				if(b1.time_created > b2.time_created){
					// if b2 is older, than swap b2 and b1 so that b1 is older
					var temp = b1
					b1 = b2
					b2 = temp
					swapped = true
				}
				combine_bacteria(b1, b2)
				//
				if(swapped){
					// older bacteria is j, so delete i
					bacteria_parts.splice(i, 1)
					j=999999
					i--
				}else{
					// older bacteria is i, so delete j
					bacteria_parts.splice(j, 1)
					j--
				}
			}
		}
	}
}
