import { loadGLTF } from "../libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;



    // Set up lighting for the scene
    const addLighting = (scene) => {
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);
    };

    // Load and configure the 3D model
    const loadAndConfigureModel = async (fileloc) => {
        const gltf = await loadGLTF(fileloc);
        gltf.scene.scale.set(0.1, 0.1, 0.1);
        gltf.scene.position.set(0, -0.4, 0);
        
        return gltf;
    };

    // Set up an anchor for the model and add it to the scene
    const addModelToAnchor = (mindarThree, model,index) => {
        const anchor = mindarThree.addAnchor(index);
        anchor.group.add(model.scene);
    };

    // Initialize and start animations for the model
    const startAnimation = (mixer,gltf,index) => {
       mixer.stopAllAction();
        //STORE ANIMATION CLIP INDEX
        const action = mixer.clipAction(gltf.animations[index]);
        action.reset().play();
        
        return mixer;
    };

    // Main rendering loop
    const startRenderingLoop = (renderer, scene, camera, mixer, gltf) => {
        const clock = new THREE.Clock();
        renderer.setAnimationLoop(() => {
            //TIMER
            const delta = clock.getDelta();
            //ROTATE WHICH AXIS AND WHICH WAY
            //gltf.scene.rotation.y=180;
            //gltf.scene.rotation.z-= delta;  // Rotate model
            mixer.update(delta);             // Update animation
            renderer.render(scene, camera);  // Render scene
        });

    };



 


document.addEventListener('DOMContentLoaded', () => {
    // Initialize MindARThree and configure the AR environment
    const initializeMindAR = () => {
        return new window.MINDAR.IMAGE.MindARThree({
            container: document.body,
            imageTargetSrc: '../assets/target/QRBig2.mind',
        });
    };
    
  
        
    
    // Main function to start the AR experience
    const start = async () => {
        const mindarThree = initializeMindAR();
        
        const { renderer, scene, camera } = mindarThree;

        addLighting(scene);
        
        const gltf = await loadAndConfigureModel('../assets/models/birdNLA2.glb');
        addModelToAnchor(mindarThree, gltf,0);
        const mixer = new THREE.AnimationMixer(gltf.scene);
     
        //to test clip animation, the bird animation will be set based on keyboard input
        document.addEventListener('keydown',(event)=>{
             const key = event.key;
            
            //play flying animation
            if(key === 'f'){

                startAnimation(mixer,gltf,1);  
            }
            //play walking animation
            else if(key === 'w'){
              
                startAnimation(mixer, gltf,2);  
            }
           
           
            }
        );
        
        
        
      // Mouse clicking gesture coding
    document.addEventListener("click", (event) => {
      // Get click coordinates
      const x = event.clientX;
      const y = event.clientY;

      // Log or display the click coordinates
        //useful for trigerring specific animation later
        //bird  hitbox
        //x 400-480
        //y 230-380
      console.log(`Clicked at X: ${x}, Y: ${y}`);
        //override keyboard input for clicking screen input 
        //trigger walking animation
        //hitbox works for HD dimension pc
        if(x>=400&&x<=480 &&y>=230 && y<=380){
              console.log('clicked bird');
         startAnimation(mixer, gltf,2);  
        }
      
    });
        
        //Phone tap screen gesture coding
        document.addEventListener("touchstart", (event) => {
      // Get tap coordinates
       var x = event.touches[0].clientX;
       var y = event.touches[0].clientY;

      // Log or display the click coordinates
        //useful for trigerring specific animation later
        //bird  hitbox

      console.log(`Tapped at X: ${x}, Y: ${y}`);
        //override keyboard input for clicking screen input 
        //trigger walking animation
        //try trigger where it intersects
        //assume percentage with diff phone dimensions
        if(x>=window.innerWidth*0.48&&x<=window.innerWidth*0.68&&y>=window.innerHeight*0.37&&y<=window.innerHeight*0.57){
         console.log('tapped bird');
            startAnimation(mixer, gltf,2);  
        }
      
    });
        
        
        //change from default camera to blender camera
        //overrides instead of plane of object, it is on display device plane
        //more stable projection
        const cam=gltf.cameras.length > 0 ? gltf.cameras[0] : mindarThree.camera;

        await mindarThree.start();
        startRenderingLoop(renderer, scene, cam, mixer, gltf);
    };

    // Begin the AR experience on DOM load
    start();
});


