console.log("booking.js loaded");
import { db } from "./firebase.js";
import { collection, getDocs } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const serviceSelect = document.getElementById("service");

async function carregarServicos() {
  const snapshot = await getDocs(collection(db, "services"));

  snapshot.forEach(doc => {
    const s = doc.data();
    serviceSelect.innerHTML += `
      <option value="${doc.id}">
        ${s.nome} - R$ ${s.preco}
      </option>
    `;
  });
}

carregarServicos();
