console.log("index.js carregado");

import { db } from "./firebase/firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ======== 1. VARIÁVEIS GLOBAIS (ESTADO) ========
let selectedDate = null;
let selectedTime = null;
let horariosIndisponiveis = [];
const availableTimes = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const serviceSelect = document.getElementById("service");
const professionalSelect = document.getElementById("professional");
const calendarEl = document.getElementById("calendar");
const timeSlotsEl = document.getElementById("timeSlots");
const form = document.getElementById("bookingForm");

// ======== 2. CARREGAMENTO DE DADOS (SELECTS) ========
async function carregarServicos() {
  serviceSelect.innerHTML = `<option value="">Selecione um serviço</option>`;
  const snapshot = await getDocs(collection(db, "services"));
  snapshot.forEach(doc => {
    const s = doc.data();
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = `${s.nome} - R$ ${s.preco}`;
    serviceSelect.appendChild(option);
  });
}

async function carregarProfissionais() {

  // Adicione isso ao final do seu arquivo index.js
  professionalSelect.addEventListener('change', () => {
    if (selectedDate) {
      carregarHorariosIndisponiveis().then(() => {
        renderTimeSlots();
      });
    }
  });

  professionalSelect.innerHTML = `<option value="">Selecione um profissional</option>`;
  const snapshot = await getDocs(collection(db, "professionals"));
  snapshot.forEach(doc => {
    const p = doc.data();
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = p.nome;
    professionalSelect.appendChild(option);
  });
}

// ======== 3. LÓGICA DO CALENDÁRIO E HORÁRIOS ========
function renderCalendar() {
  calendarEl.innerHTML = "";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "calendar-day";
    btn.textContent = day;

    const dateCheck = new Date(year, month, day);
    if (dateCheck < new Date().setHours(0, 0, 0, 0)) {
      btn.classList.add("disabled");
      btn.disabled = true;
    } else {
      btn.onclick = (e) => selectDate(day, e.target);
    }

    calendarEl.appendChild(btn);
  }
}

// ======== 2. SELEÇÃO DE DATA ========
async function selectDate(day, element) {
  const now = new Date();
  selectedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Destaque visual
  document.querySelectorAll(".calendar-day").forEach(btn => btn.classList.remove("active", "selected"));
  element.classList.add("selected");

  await carregarHorariosIndisponiveis();
  renderTimeSlots();
}

// ======== 3. LÓGICA DE HORÁRIOS (FIREBASE) ========
async function carregarHorariosIndisponiveis() {
  horariosIndisponiveis = [];
  if (!selectedDate || !professionalSelect.value) return;

  // Busca no Firebase agendamentos existentes para o dia e profissional
  const q = query(
    collection(db, "appointments"),
    where("data", "==", selectedDate),
    where("profissionalId", "==", professionalSelect.value)
  );

  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    horariosIndisponiveis.push(doc.data().horario);
  });
}

function renderTimeSlots() {
  if (!selectedDate || !professionalSelect.value) {
    timeSlotsEl.innerHTML = "<p class='alert-message'>Para ver os horários disponíveis, selecione um Serviço e um profissional.</p>";
    alert('Selecione serviço e profissional primeiro!');
    return;
  }

  timeSlotsEl.innerHTML = "";

  availableTimes.forEach(time => {
    const indisponivel = horariosIndisponiveis.includes(time);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `time-slot ${indisponivel ? "disabled" : ""}`;
    btn.textContent = time;
    btn.disabled = indisponivel;

    btn.onclick = () => {
      selectedTime = time;
      document.querySelectorAll(".time-slot").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    };

    timeSlotsEl.appendChild(btn);
  });
}

// ======== 4. ENVIO DO FORMULÁRIO ========
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!selectedDate || !selectedTime) {
    alert("Por favor, selecione uma data e um horário!");
    return;
  }

  const dados = {
    nomeCliente: document.getElementById("name").value,
    telefone: document.getElementById("phone").value,
    servicoId: serviceSelect.value,
    profissionalId: professionalSelect.value,
    data: selectedDate,
    horario: selectedTime,
    criadoEm: Timestamp.now()
  };

  try {
    await addDoc(collection(db, "appointments"), dados);
    alert("Agendamento realizado com sucesso!");

    // Resetar interface
    form.reset();
    selectedDate = null;
    selectedTime = null;
    renderCalendar();
    timeSlotsEl.innerHTML = "";
  } catch (error) {
    console.error("Erro ao salvar:", error);
    alert("Erro ao salvar agendamento.");
  }
});

// Inicialização única
renderCalendar();
carregarServicos();
carregarProfissionais();

const phoneInput = document.getElementById("phone");

if (phoneInput) {
  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);

    if (value.length > 7) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }

    e.target.value = value;
  });
}