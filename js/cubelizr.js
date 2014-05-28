/**
 *
 * 
 *
 * Types of animation: http://sole.github.io/tween.js/examples/03_graphs.html 
 *
 */

function Cubelizr(init_config) {

	// Canvas properties
	var mouseX = 0, mouseY = 0;

	// ThreeJS 
	var container, stats = null;
	var camera, scene, renderer;

	// Global configuration
	var config = {};

	// Textures loaded
	var textures = [];

	var objects_defaults = {};

	// World objects
	var world_objects = [];


	var canvasWidth = 0; 
	var canvasHeight = 0;
	var windowHalfX = 0;
	var windowHalfY = 0;





	//
	// Lets process the user data
	//
	var validateUserInput = function() {

		// Get DOM element for work in
		container = $(init_config.zone);
		if (!container.length ) {
			console.log( "Cubelizr: please configure a zone (selector) for place the canvas." );
			return;
		}

		// Set tile size
		if(typeof init_config.tilesize == 'undefined' || isNaN(init_config.tilesize))
			init_config.tilesize = 50;
		if(typeof init_config.gridsize == 'undefined' || isNaN(init_config.gridsize))
			init_config.gridsize = 10;

		// Set the size of the canvas
		if(typeof init_config.height != 'undefined')
			canvasHeight = init_config.height;
		else canvasHeight = container.height();

		if(typeof init_config.width != 'undefined') 
			canvasWidth = init_config.width;
		else canvasWidth = container.width();

		windowHalfX = canvasWidth / 2;
		windowHalfY = canvasHeight / 2;
	
		// Set valid color for canvas
		if(typeof init_config.backgroundColor == 'undefined' || !isValidHexColor(init_config.backgroundColor))
			init_config.backgroundColor = container.css('backgroundColor');

		if(typeof init_config.backgroundColor != 'undefined')
			processUserConfiguration(init_config.backgroundColor);


		// Process the configuration of the cubes
		processUserInput(init_config);
		

		if(typeof init_config.url != 'undefined') {

			// Retrieve json configuration file
			jQuery.getJSON(init_config.url, function( data ) {

				processUserInput(data);
	
			}).fail(function() {

				console.log( "Cubelizr: The JSON configuration file could not be loaded." );

			}).done(function() {

				initCanvas();

			});
		}

		// ???? executed before ????
		//initCanvas();

	};


	//
	//
	// Private functions
	//
	//

	var initCanvas = function() {

		// 1. Create canvas and scene
		configureScene();

		// 2. Draw world objects
		configureWorldObjects();

		// Lights
		configureLights();

		// Stats
		if(config.display_stats)
			featureStats();
		
		// Grid
		if(config.display_grid)
			featureGrid();

		// 3. Init draw loop func
		draw();


		// Events 
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		//window.addEventListener( 'resize', onWindowResize, false );	

	};


	// Draw Loop
	var draw = function() {

		requestAnimationFrame( draw );

		TWEEN.update();

		if(config.mouse_control) {
			camera.position.x += ( mouseX - camera.position.x + 200) * 0.05;
			camera.position.y += ( - mouseY - camera.position.y + 200) * 0.05;
			camera.lookAt( scene.position );
		}

		renderer.render( scene, camera );

		if (stats !== null)
			stats.update();

	}


	// Scene Configuration
	var configureScene = function() {

		// Camera
		camera = new THREE.OrthographicCamera( canvasWidth / - 2, canvasWidth / 2, canvasHeight / 2, canvasHeight / - 2, - 500, 5000 );
		
		// Scene
		scene = new THREE.Scene();

		camera.position.x = 200;
		camera.position.y = 200;
		camera.position.z = 200;

		camera.lookAt( scene.position );

		// Renderer
		renderer = new THREE.CanvasRenderer();
		renderer.setClearColor( init_config.backgroundColor );
		renderer.setSize( canvasWidth, canvasHeight );

		container.append( renderer.domElement );
	};

	// Add world objects to the scene
	var configureWorldObjects = function() {

		$.each( world_objects , function( key, val ) {
			val.tween.start();
			scene.add(val.getMesh());
		});

	}

	// Light Initialization
	var configureLights = function() {

		var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
		scene.add( ambientLight );

		var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
		directionalLight.position.x = Math.random() - 0.5;
		directionalLight.position.y = Math.random() - 0.5;
		directionalLight.position.z = Math.random() - 0.5;
		directionalLight.position.normalize();
		scene.add( directionalLight );

		var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
		directionalLight.position.x = Math.random() - 0.5;
		directionalLight.position.y = Math.random() - 0.5;
		directionalLight.position.z = Math.random() - 0.5;
		directionalLight.position.normalize();
		scene.add( directionalLight );

	};






	// Displays the stats (framerate)
	var featureStats = function() {
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';

		container.append( stats.domElement );
	};

	// Grid Initialization
	var featureGrid = function() {

		var size = (init_config.gridsize * init_config.tilesize)/2;
		var step = init_config.tilesize;

		var geometry = new THREE.Geometry();

		for ( var i = - size; i <= size; i += step ) {

			geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
			geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

			geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
			geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

		}

		var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );

		var line = new THREE.Line( geometry, material );
		line.type = THREE.LinePieces;

		//line.position.x = 0;
		//line.position.y = 0; 
		//line.position.z = 0;

		if(init_config.gridsize % 2 == 0)
		{
			line.position.x -= init_config.tilesize/2;
			line.position.z -= init_config.tilesize/2;
		}
		
		scene.add( line );
	};










	//
	// Process entry JSON data
	//

	var processUserInput = function(input) {
		if(typeof input.config != 'undefined')
			processUserConfiguration(input.config);

		if(typeof input.defaults != 'undefined')
			processUserDefaults(input.defaults);

		if(typeof input.textures != 'undefined')
			processUserTextures(input.textures);

		if(typeof input.objects != 'undefined')
			processUserData(input.objects);
	}

	// - Load features configuration -
	var processUserConfiguration = function(user_conf) {

		config.mouse_control = user_conf.mouse_control === 1 ? true : false;
		config.display_grid = user_conf.display_grid === 1 ? true : false;
		config.display_stats = user_conf.display_stats === 1 ? true : false;

	};

	// - Load default values for objects -
	var processUserDefaults = function(user_defaults) {

		objects_defaults.type = user_defaults.type ? user_defaults.type : "cube";
		objects_defaults.color = user_defaults.color ? user_defaults.color : "0xff22ff";
		objects_defaults.texture = user_defaults.texture ? user_defaults.texture : "";
		objects_defaults.opacity = user_defaults.opacity ? user_defaults.opacity : "0xff22ff";
		objects_defaults.start = user_defaults.start ? user_defaults.start : 0.1;
		objects_defaults.duration = user_defaults.duration ? user_defaults.duration : 2.0;
		objects_defaults.animation = user_defaults.animation ? user_defaults.animation : "Elastic.InOut";
		objects_defaults.height = user_defaults.height ? user_defaults.height : 100;

	};

	// Prepare textures for render
	var processUserTextures = function(user_textures) {

		textures = user_textures;

		if(textures)
			$.each( textures , function( key, val ) {

				if(val.url.length == 6)
				{
					val.material = [
						new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture(val.url[0]) }),
						new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture(val.url[1]) }),
						new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture(val.url[2]) }),
						new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture(val.url[3]) }),
						new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture(val.url[4]) }),
						new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture(val.url[5]) })
					];
				} else {
					// val.texture = THREE.ImageUtils.loadTexture(val.url[0]);
					val.material = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture(val.url[0]) });
				}

			});
	};

	// Load every object defined in the json file
	var processUserData = function(user_data) {

		// - Process objects -
		$.each( user_data , function( key, val ) {

			// Load definition of the object
			var obj_type = val.type ? val.type : objects_defaults.type;
			var obj_color = val.color ? val.color : objects_defaults.color;
			var obj_opacity = val.opacity ? val.opacity : objects_defaults.opacity;
			var obj_start = val.start ? val.start : objects_defaults.start;
			var obj_duration = val.duration ? val.duration : objects_defaults.duration;
			var obj_animation = val.animation ? val.animation : objects_defaults.animation;
			var obj_x = val.x ? val.x : 0;
			var obj_y = val.y ? val.y : 0;
			var obj_z = val.z ? val.z : 0;
			var obj_height = val.height ? val.height : objects_defaults.height;
			var obj_texture = val.texture ? val.texture : objects_defaults.texture;
			
			// If it's defined a texture, and exist in the array, store it
			var texture_mat = null;
			if(obj_texture !== "")
				texture_mat = $.grep(textures, function(e){ return e.id == obj_texture; })[0];
			

			// 1. Create object
			var obj = new CubelizrObject(obj_type, init_config.tilesize, obj_color, texture_mat, obj_opacity);

			// 2. Set initial position
			obj.translate_object(obj_x, obj_y, obj_height);

			// 3. Configure animation
			obj.animate_object(obj_height, obj_start, obj_z, obj_duration, obj_animation);

			// 4. Store object
			world_objects.push(obj);
		});

	};






	//
	// Events
	//

	var onWindowResize = function() {
	
		windowHalfX = canvasWidth / 2;
		windowHalfY = canvasHeight / 2;

		camera.aspect = canvasWidth / canvasHeight;
		
		camera.left = canvasWidth / - 2;
		camera.right = canvasWidth / 2;
		camera.top = canvasHeight / 2;
		camera.bottom = canvasHeight / - 2;
		
		camera.updateProjectionMatrix();

		renderer.setSize( canvasWidth, canvasHeight );

	};

	var onDocumentMouseMove = function(event) {

		mouseX = ( event.clientX - windowHalfX );
		mouseY = ( event.clientY - windowHalfY );

	};


	//
	// Parse funcs
	//

	var isValidHexColor = function(color) {
		return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
	}
	


	

	// Start class process
	validateUserInput();
	
}














//
// 3D Object definition displayed in the world
//

function CubelizrObject(obj_type, obj_size, obj_color, obj_texture, obj_opacity) {

	// textures

	var geometry;
	var mesh;
	var material = null;
	var size = obj_size;

	// - 3dObject -
	switch(obj_type) {
		case "cube":
		default:
			geometry = new THREE.BoxGeometry( size, size, size ); 
	}

	// - Texture -
	// If it's defined a texture, and exist in the array, draw it,
	if(obj_texture !== null) {
		if(obj_texture.url.length == 6)
			material = new THREE.MeshFaceMaterial( obj_texture.material );
		else material = obj_texture.material;
		//	material = new THREE.MeshLambertMaterial({ map: result[0].texture, opacity: obj_opacity });
	}
		
	// Else draw plain colour
	if(material === null) {
		// RGB color
		material = new THREE.MeshBasicMaterial({ 
			color: obj_color, 
			opacity: obj_opacity, 
			side: THREE.DoubleSide,
			wireframe: false
		});
	}

	// - Mesh -
	mesh = new THREE.Mesh( geometry, material );
	


	//
	// Public functions
	//

	this.getMesh = function() {
		return mesh;
	}

	// Move object
	this.translate_object = function(x, y, height) {

		mesh.position.x = size * x -size*4;
		mesh.position.y = height;
		mesh.position.z = size * y -size*4;

	}

	this.animate_object = function(height, start, z, duration, animation) {

		// - Tween -
		var position = { y: height };
		var target = { y: z * size + size/2 };

		var tween = new TWEEN.Tween(position).to(target, duration*1000);

		tween.delay(start * 100);

		tween.easing(tween_animation(animation));

		tween.onUpdate(function() {
			mesh.position.y = position.y;
		});

		this.tween = tween;

	}


	var tween_animation = function(animation_str) {
		switch(animation_str) {
			case "Linear.None": return TWEEN.Easing.Linear.None;
			case "Quadratic.In": return TWEEN.Easing.Quadratic.In; 
			case "Quadratic.Out": return TWEEN.Easing.Quadratic.Out;
			case "Quadratic.InOut": return TWEEN.Easing.Quadratic.InOut;
			case "Cubic.In": return TWEEN.Easing.Cubic.In;
			case "Cubic.Out": return TWEEN.Easing.Cubic.Out;
			case "Cubic.InOut": return TWEEN.Easing.Cubic.InOut;
			case "Quartic.In": return TWEEN.Easing.Quartic.In;
			case "Quartic.Out": return TWEEN.Easing.Quartic.Out;
			case "Quartic.InOut": return TWEEN.Easing.Quartic.InOut;
			case "Quintic.In": return TWEEN.Easing.Quintic.In;
			case "Quintic.Out": return TWEEN.Easing.Quintic.Out;
			case "Quintic.InOut": return TWEEN.Easing.Quintic.InOut;
			case "Sinusoidal.In": return TWEEN.Easing.Sinusoidal.In;
			case "Sinusoidal.Out": return TWEEN.Easing.Sinusoidal.Out;
			case "Sinusoidal.InOut": return TWEEN.Easing.Sinusoidal.InOut;
			case "Exponential.In": return TWEEN.Easing.Exponential.In;
			case "Exponential.Out": return TWEEN.Easing.Exponential.Out;
			case "Exponential.InOut": return TWEEN.Easing.Exponential.InOut;
			case "Circular.In": return TWEEN.Easing.Circular.In;
			case "Circular.Out": return TWEEN.Easing.Circular.Out;
			case "Circular.InOut": return TWEEN.Easing.Circular.InOut;
			case "Elastic.In": return TWEEN.Easing.Elastic.In;
			case "Elastic.Out": return TWEEN.Easing.Elastic.Out;
			case "Elastic.InOut": return TWEEN.Easing.Elastic.InOut;
			case "Back.In": return TWEEN.Easing.Back.In;
			case "Back.Out": return TWEEN.Easing.Back.Out;
			case "Back.InOut": return TWEEN.Easing.Back.InOut;
			case "Bounce.In": return TWEEN.Easing.Bounce.In;
			case "Bounce.Out": return TWEEN.Easing.Bounce.Out;
			case "Bounce.InOut": return TWEEN.Easing.Bounce.InOut;
			default: return TWEEN.Easing.Linear.None; 
		}
	};

}









