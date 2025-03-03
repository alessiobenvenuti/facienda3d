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
  'Scopa.fbx',
  'Pianta.fbx',
  'Lavatrice.fbx',
  'Frigo.fbx',
];

// Lista fissa dei modelli
const fixedModels = [
  
  { model: 'Lavatrice.fbx', task: 'fare lavatrice' },
  { model: 'Termosifone.fbx', task: 'accendere riscaldamento' },
  { model: 'Pianta.fbx', task: 'annaffiare pianta' },
  
  
];

let models = [...fixedModels]; // Lista dei task attivi, inizializzata con i modelli fissi
let currentModelIndex = 0;
let currentModel;

// Funzione per aggiornare il contatore dei task
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
    return; // Interrompi il caricamento del modello
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


/*
// Funzione per caricare un modello
function loadModel(index) {
  if (currentModel) {
    scene.remove(currentModel);
  }

  const { model } = models[index];

  loader.load(`/models/${model}`, (fbx) => {
    currentModel = fbx;
    currentModel.position.set(0, 1, 0);
    currentModel.scale.set(0.002, 0.002, 0.002);
    scene.add(currentModel);
    updateTaskLabelFromIndex(); // Aggiorna il testo del task
  }, undefined, (error) => {
    console.error('Errore nel caricamento del modello:', error);
  });
}
  */

//navigazione tra modelli
document.getElementById('prev').onclick = () => {
  if (models.length === 0) return; // Blocca se non ci sono modelli
  currentModelIndex = (currentModelIndex - 1 + models.length) % models.length;
  loadModel(currentModelIndex);
};

document.getElementById('next').onclick = () => {
  if (models.length === 0) return; // Blocca se non ci sono modelli
  currentModelIndex = (currentModelIndex + 1) % models.length;
  loadModel(currentModelIndex);
};


// Resize responsivo
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Funzione per aggiornare la posizione del bottone "Fatto" in base alla posizione del modello

function updateButtonPosition() {
  const btn = document.getElementById("done-btn");

  if (currentModel) {
    const vector = new THREE.Vector3();
    vector.copy(currentModel.position);
    vector.project(camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

    btn.style.left = `${x - 40}px`;
    btn.style.top = `${y + 250}px`;
    btn.style.display = 'block'; // Mostra il bottone se c'è un modello
  } else {
    btn.style.display = 'none'; // Nascondi il bottone se non ci sono modelli
  }
}

/*
function updateButtonPosition() {
  if (currentModel) {
    const vector = new THREE.Vector3();
    vector.copy(currentModel.position);
    vector.project(camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

    const btn = document.getElementById("done-btn");
    btn.style.left = `${x - 40}px`;
    btn.style.top = `${y + 250}px`;
  }
}
*/


// Funzione per aggiornare la posizione dell'etichetta del task

function updateTaskLabelPosition() {
  const label = document.getElementById("task-label");

  if (currentModel) {
    const vector = new THREE.Vector3();
    vector.copy(currentModel.position);
    vector.project(camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

    label.style.left = `${x - label.offsetWidth / 2 +40 }px`;
    label.style.top = `${y - label.offsetHeight - 160}px`;
  } else {
    // Quando non c'è modello, centra il testo o lo sposti in una posizione fissa
    label.style.left = `50%`;
    label.style.top = `100px`;
    label.style.transform = 'translateX(-50%)';
  }
}

/*
function updateTaskLabelPosition() {
  if (currentModel) {
    const vector = new THREE.Vector3();
    vector.copy(currentModel.position);
    vector.project(camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

    const label = document.getElementById("task-label");
    label.style.left = `${x - label.offsetWidth / 2}px`;
    label.style.top = `${y - label.offsetHeight - 160}px`;
  }
}
  */

// Funzione che aggiorna il task corrente
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




// Array per salvare lo storico
const completedTasksHistory = [];

// Modifica del pulsante "Fatto" per salvare i task completati
document.getElementById('done-btn').onclick = () => {
  if (models.length === 0) return;

  const completedTask = models[currentModelIndex];
  completedTasksHistory.push(completedTask); // Salvo nello storico

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
  historyList.innerHTML = ''; // Reset

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

/*
// Apertura del modal storico
document.getElementById('history-btn').onclick = () => {
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = ''; // Reset

  if (completedTasksHistory.length === 0) {
    historyList.innerHTML = '<li>Nessuna attività completata.</li>';
  } else {
    completedTasksHistory.forEach((task, index) => {
      const li = document.createElement('li');
      li.textContent = `${index + 1}. ${task.task}`; //(${task.model})
      historyList.appendChild(li);
    });
  }

  document.getElementById('history-modal').style.display = 'flex';
};
*/

// Chiusura del modal storico
document.getElementById('close-history-btn').onclick = () => {
  document.getElementById('history-modal').style.display = 'none';
};



/*
// Funzione di gestione del pulsante "Fatto"
document.getElementById('done-btn').onclick = () => {
  if (models.length === 0) return;

  // 🎉 Effetto coriandoli
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });

  // Rimuovi il modello dalla scena
  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }

  // Rimuovi il modello dalla lista dei task
  models.splice(currentModelIndex, 1);

  // Se non ci sono modelli disponibili, aggiorna l'interfaccia
  if (models.length === 0) {
    updateCounter();
    updateTaskLabelFromIndex();
    return;
  }

  // Se l'indice attuale è fuori dal range, azzeralo
  if (currentModelIndex >= models.length) {
    currentModelIndex = 0;
  }

  loadModel(currentModelIndex);
  updateCounter();
};
*/



document.getElementById('new-task-btn').onclick = () => {
  document.getElementById('task-modal').style.display = 'flex';

  const modelSelect = document.getElementById('model-select');
  modelSelect.innerHTML = ''; // Reset lista modelli

  allModels.forEach((modelName) => {
    const option = document.createElement('option');
    option.value = modelName; // Ora il valore è il nome del modello
    option.textContent = modelName;
    modelSelect.appendChild(option);
  });
};

/*
// Funzione per aggiungere un nuovo task (con il modello selezionato)
document.getElementById('new-task-btn').onclick = () => {
  // Mostra il modal per aggiungere un nuovo task
  document.getElementById('task-modal').style.display = 'flex';

  // Popola la lista dei modelli nel select
  const modelSelect = document.getElementById('model-select');
  modelSelect.innerHTML = ''; // Reset lista modelli
  
  // Popola il select solo con i modelli fissi (che sono disponibili)
  fixedModels.forEach((modelObj, index) => {
    // Se il modello non ha ancora un task associato
    if (!models.some(task => task.model === modelObj.model)) {
      const option = document.createElement('option');
      option.value = index; // Usa l'indice per identificare il modello
      option.textContent = modelObj.model; // Mostra il nome del modello
      modelSelect.appendChild(option);
    }
  });
};
*/

// Annulla l'operazione (chiudi la finestra)
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


/*
// Conferma l'aggiunta del nuovo task
document.getElementById('confirm-btn').onclick = () => {
  const taskName = document.getElementById('new-task-name').value;
  const modelIndex = document.getElementById('model-select').value;

  if (taskName && modelIndex !== null) {
    // Crea un nuovo task e modello
    const newTask = {
      model: fixedModels[modelIndex].model,  // Aggiungi il modello selezionato
      task: taskName  // Il task inserito
    };

    // Aggiungi il nuovo task alla lista
    models.push(newTask);

    // Chiudi il modal
    document.getElementById('task-modal').style.display = 'none';

    // Ricarica il modello e aggiorna la vista
    currentModelIndex = models.length - 1;
    loadModel(currentModelIndex);
    updateCounter();
    updateTaskLabelFromIndex();
  } else {
    alert("Compila tutti i campi.");
  }
};
*/


// Pulsante per aprire la finestra delle informazioni
document.getElementById('info-btn').onclick = () => {
  document.getElementById('info-modal').style.display = 'block';  // Mostra il modale
};

// Pulsante per chiudere la finestra delle informazioni
document.getElementById('close-info').onclick = () => {
  document.getElementById('info-modal').style.display = 'none';  // Nasconde il modale
};



// POST PROCESSING
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// Bloom pass
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,  // Intensità bloom
  0.4,  // Raggio
  0.85  // Soglia
);
composer.addPass(bloomPass);

// Animazione
function animate() {
  requestAnimationFrame(animate);
  if (currentModel) currentModel.rotation.y += 0.005; // Rotazione leggera per effetto dinamico
  renderer.render(scene, camera);

  updateCounter();
  updateButtonPosition();
  updateTaskLabelPosition();
}

loadModel(currentModelIndex);
animate();
