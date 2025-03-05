import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Post-processing
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Animazione coriandoli
import confetti from 'canvas-confetti';

// Setup scena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Skybox celeste

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luci
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Loader modelli
const loader = new FBXLoader();

const allModels = [

  'Termosifone.fbx',
  'Lavatrice.fbx',
  'Lavastoviglie.fbx',
  'Frigo.fbx',
  'Pianta.fbx',
  'Microonde.fbx',
  'Tavolo.fbx',
  'Finestra.fbx',
  'Ventilatore.fbx',
  'TaskGenerico.fbx',


];


const fixedModels = [
  
  { model: 'Lavatrice.fbx', task: 'fare lavatrice' },
  { model: 'Termosifone.fbx', task: 'accendere riscaldamento' },
  { model: 'Pianta.fbx', task: 'annaffiare pianta' },
  
  
];

let models = [...fixedModels]; 
let currentModelIndex = 0;
let currentModel;


function updateCounter() {
  const counterElement = document.getElementById('model-counter');
  if (models.length === 0) {
    counterElement.innerText = '0 / 0';
  } else {
    counterElement.innerText = `${currentModelIndex + 1} / ${models.length}`;
  }
  console.log('Contatore aggiornato:', counterElement.innerText);
}




function loadModel(index) {
  if (models.length === 0) {
    console.warn('Nessun modello disponibile da caricare.');
    updateTaskLabel("Lista vuota, inizia ad aggiungere task tramite il pulsante +Nuovo Task.");
    updateCounter();
    return; // Interrompe il caricamento del modello
  }

  if (currentModel) {
    scene.remove(currentModel);
  }

  const { model } = models[index];

  loader.load(`/facienda3d/models/${model}`, (fbx) => {
    currentModel = fbx;
    currentModel.position.set(0, 1, 0);
    currentModel.scale.set(0.002, 0.002, 0.002);
    scene.add(currentModel);
    updateTaskLabelFromIndex();
  }, undefined, (error) => {
    console.error('Errore nel caricamento del modello:', error);
  });
}


//navigazione tra modelli
document.getElementById('prev').onclick = () => {
  if (models.length === 0) return; 
  currentModelIndex = (currentModelIndex - 1 + models.length) % models.length;
  loadModel(currentModelIndex);
};

document.getElementById('next').onclick = () => {
  if (models.length === 0) return; // return se non ci sono modelli
  currentModelIndex = (currentModelIndex + 1) % models.length;
  loadModel(currentModelIndex);
};



window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



function updateButtonPosition() {
  const btn = document.getElementById("done-btn");

  if (currentModel) {
    const vector = new THREE.Vector3();
    vector.copy(currentModel.position);
    vector.project(camera);

    //const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    //const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

    //btn.style.left = `${x - 40}px`;
    //btn.style.top = `${y + 250}px`;
    
    btn.style.left = `50%`;
    btn.style.top = `600px`;
    btn.style.transform = 'translateX(-50%)';

    btn.style.display = 'block'; 
  } else {
    btn.style.left = `50%`;
    btn.style.top = `600px`;
    btn.style.transform = 'translateX(-50%)';
    btn.style.display = 'none'; // Nascondi il bottone se non ci sono modelli
    
  }
}


function updateTaskLabelPosition() {
  const label = document.getElementById("task-label");

  if (currentModel) {
    const vector = new THREE.Vector3();
    vector.copy(currentModel.position);
    vector.project(camera);

    //const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    //const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

    label.style.left = `50%`;
    label.style.top = `100px`;
    label.style.transform = 'translateX(-50%)';

    //label.style.left = `${x - label.offsetWidth / 2 +40 }px`;
    //label.style.top = `${y - label.offsetHeight - 160}px`;
  } else {
    
    label.style.left = `50%`;
    label.style.top = `100px`;
    label.style.transform = 'translateX(-50%)';
  }
}


function updateTaskLabel(text) {
  const taskLabel = document.getElementById('task-label');
  taskLabel.textContent = text;
}

function updateTaskLabelFromIndex() {
  if (models.length === 0) {
    updateTaskLabel("Hai completato la lista di cose da fare 🎉");
  } else {
    updateTaskLabel(`Da Fare: ${models[currentModelIndex].task}`);
  }
}



const completedTasksHistory = [];


document.getElementById('done-btn').onclick = () => {
  if (models.length === 0) return;

  const completedTask = models[currentModelIndex];
  completedTasksHistory.push(completedTask); // Salvataggio nello storico

  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });

  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }

  models.splice(currentModelIndex, 1);

  if (models.length === 0) {
    currentModelIndex = 0;
    updateCounter();
    updateTaskLabelFromIndex();
    return;
  }

  if (currentModelIndex >= models.length) {
    currentModelIndex = 0;
  }

  loadModel(currentModelIndex);
  updateCounter();
};


document.getElementById('history-btn').onclick = () => {
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = ''; 

  if (completedTasksHistory.length === 0) {
    if (models.length === 0) {
      historyList.innerHTML = '<li>Lista vuota, inizia ad aggiungere task tramite il pulsante +Nuovo Task.</li>';
    } else {
      historyList.innerHTML = '<li>Nessuna attività completata.</li>';
    }
  } else {
    completedTasksHistory.forEach((task, index) => {
      const li = document.createElement('li');
      li.textContent = `${index + 1}. ${task.task}`;
      historyList.appendChild(li);
    });
  }

  document.getElementById('history-modal').style.display = 'flex';
};



document.getElementById('close-history-btn').onclick = () => {
  document.getElementById('history-modal').style.display = 'none';
};



document.getElementById('new-task-btn').onclick = () => {
  document.getElementById('task-modal').style.display = 'flex';

  const modelSelect = document.getElementById('model-select');
  modelSelect.innerHTML = ''; 

  allModels.forEach((modelName) => {
    const option = document.createElement('option');
    option.value = modelName; 
    option.textContent = modelName;
    modelSelect.appendChild(option);
  });
};



document.getElementById('cancel-btn').onclick = () => {
  document.getElementById('task-modal').style.display = 'none';
};


document.getElementById('confirm-btn').onclick = () => {
  const taskName = document.getElementById('new-task-name').value;
  const selectedModel = document.getElementById('model-select').value;

  if (taskName && selectedModel) {
    const newTask = {
      model: selectedModel,
      task: taskName
    };

    models.push(newTask);

    document.getElementById('task-modal').style.display = 'none';
    currentModelIndex = models.length - 1;
    loadModel(currentModelIndex);
    updateCounter();
    updateTaskLabelFromIndex();
  } else {
    alert("Compila tutti i campi.");
  }
};



document.getElementById('info-btn').onclick = () => {
  document.getElementById('info-modal').style.display = 'block';  
};


document.getElementById('close-info').onclick = () => {
  document.getElementById('info-modal').style.display = 'none';  
};

// POST PROCESSING
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,  
  0.4,  
  0.85  
);
composer.addPass(bloomPass);


function animate() {
  requestAnimationFrame(animate);
  if (currentModel) currentModel.rotation.y += 0.005; 
  renderer.render(scene, camera);

  updateCounter();
  updateButtonPosition();
  updateTaskLabelPosition();
}

loadModel(currentModelIndex);
animate();
