console.log("admin.js loaded");
import { db } from "./firebase/firebase.js";
import {
  collection, addDoc, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

/* 🔐 PROTEÇÃO
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
  }
}); */

// ===== SERVIÇOS =====
const servicesRef = collection(db, "services");

async function addServico() {
  await addDoc(servicesRef, {
    nome: serviceNome.value,
    preco: Number(servicePreco.value),
    duracao: Number(serviceDuracao.value)
  });
  serviceNome.value = servicePreco.value = serviceDuracao.value = "";
  listarServicos();
}

async function listarServicos() {
  listaServicos.innerHTML = "";
  const snapshot = await getDocs(servicesRef);

  snapshot.forEach(docItem => {
    const s = docItem.data();
    listaServicos.innerHTML += `
      <tr>
        <td>${s.nome}</td>
        <td>R$ ${s.preco}</td>
        <td>${s.duracao} min</td>
        <td class="actions">
          <button onclick="removerServico('${docItem.id}')">Excluir</button>
        </td>
      </tr>
    `;
  });
}

async function removerServico(id) {
  await deleteDoc(doc(db, "services", id));
  listarServicos();
}

// ===== PROFISSIONAIS =====
async function addProfissional() {
  await addDoc(collection(db, "professionals"), {
    nome: profNome.value
  });
  profNome.value = "";
  listarProfissionais();
}

async function listarProfissionais() {
  listaProfissionais.innerHTML = "";
  const snapshot = await getDocs(collection(db, "professionals"));

  snapshot.forEach(p => {
    listaProfissionais.innerHTML += `<li>${p.data().nome}</li>`;
  });
}

// ===== AGENDAMENTOS =====
// ======== 1. FUNÇÕES DE CANCELAMENTO E EXPOSIÇÃO ========

// Função para cancelar agendamento
async function cancelar(id) {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
        try {
            // Importante: certifique-se que 'db', 'doc' e 'deleteDoc' foram importados do Firebase
            await deleteDoc(doc(db, "appointments", id));
            alert("Agendamento removido com sucesso!");
            listarAgendamentos(); // Recarrega a lista após deletar
        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert("Erro ao remover agendamento.");
        }
    }
}

// Expõe para o window para que o onclick do HTML funcione
window.cancelar = cancelar;


// ======== 2. FUNÇÃO ÚNICA DE LISTAGEM (Mantenha apenas esta) ========

async function listarAgendamentos() {
    const listaAgendamentos = document.getElementById("listaAgendamentos");
    if (!listaAgendamentos) return;

    listaAgendamentos.innerHTML = "<tr><td colspan='5'>Carregando agendamentos...</td></tr>";

    try {
        // A. Busca nomes dos serviços primeiro (para evitar o 'undefined')
        const servicosSnapshot = await getDocs(collection(db, "services"));
        const nomesServicos = {};
        servicosSnapshot.forEach(doc => {
            nomesServicos[doc.id] = doc.data().nome; 
        });

        // B. Busca os agendamentos
        const snapshot = await getDocs(collection(db, "appointments"));
        listaAgendamentos.innerHTML = ""; // Limpa a mensagem de carregamento

        if (snapshot.empty) {
            listaAgendamentos.innerHTML = "<tr><td colspan='5'>Nenhum agendamento encontrado.</td></tr>";
            return;
        }

        snapshot.forEach(a => {
            const ag = a.data();
            const id = a.id;
            const servicoNome = nomesServicos[ag.servicoId] || "Serviço não encontrado";
            const dataFormatada = ag.data ? ag.data.split('-').reverse().join('/') : "---";

            listaAgendamentos.innerHTML += `
                <tr>
                    <td>${ag.nomeCliente || 'Sem nome'}</td>
                    <td>${servicoNome}</td>
                    <td>${dataFormatada}</td>
                    <td>${ag.horario}</td>
                    <td class="actions">
                        <button class="btn-cancel" onclick="cancelar('${id}')">Cancelar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Erro ao listar agendamentos:", error);
        listaAgendamentos.innerHTML = "<tr><td colspan='5'>Erro ao carregar dados.</td></tr>";
    }
}

listarAgendamentos();

// 🔓 LOGOUT
function logout() {
  signOut(auth);
}

// EXPOSE
window.addServico = addServico;
window.removerServico = removerServico;
window.addProfissional = addProfissional;
window.logout = logout;

// INIT
listarServicos();
listarProfissionais();
listarAgendamentos();
