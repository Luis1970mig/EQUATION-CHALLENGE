(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "equationChallenge_v1";
  const state = {
    role: "student", name: "", page: "dashboard", questions: [], index: 0,
    sessionCorrect: 0, sessionPoints: 0, answered: false, currentQuestions: []
  };
  const levels = [
    {name:"Nivel 1 · Fundamentos",desc:"Ecuaciones de un paso y operaciones inversas.",count:5},
    {name:"Nivel 2 · En acción",desc:"Ecuaciones con paréntesis y dos operaciones.",count:5},
    {name:"Nivel 3 · Desafío experto",desc:"Incógnitas en ambos miembros de la igualdad.",count:5}
  ];
  const bank = [
    {eq:"x + 7 = 15",answer:8,hint:"Resta 7 en ambos miembros.",level:1,type:"Ecuación de suma",points:10},
    {eq:"3x = 24",answer:8,hint:"Divide ambos miembros para 3.",level:1,type:"Ecuación de multiplicación",points:10},
    {eq:"x - 9 = 4",answer:13,hint:"Suma 9 en ambos miembros.",level:1,type:"Ecuación de resta",points:10},
    {eq:"2x + 5 = 17",answer:6,hint:"Primero resta 5; después divide para 2.",level:1,type:"Dos operaciones",points:10},
    {eq:"x / 4 = 6",answer:24,hint:"Multiplica ambos miembros por 4.",level:1,type:"Ecuación de división",points:10},
    {eq:"3(x + 2) = 21",answer:5,hint:"Divide para 3 y luego resta 2.",level:2,type:"Propiedad distributiva",points:20},
    {eq:"5x - 8 = 22",answer:6,hint:"Suma 8 y divide para 5.",level:2,type:"Dos operaciones",points:20},
    {eq:"2(x - 3) = 14",answer:10,hint:"Divide para 2 y suma 3.",level:2,type:"Paréntesis",points:20},
    {eq:"(x + 5) / 3 = 7",answer:16,hint:"Multiplica por 3 y resta 5.",level:2,type:"Ecuación fraccionaria",points:20},
    {eq:"4x + 3 = 2x + 15",answer:6,hint:"Resta 2x en ambos miembros y luego resta 3.",level:3,type:"Incógnita en ambos miembros",points:30},
    {eq:"7x - 5 = 4x + 10",answer:5,hint:"Agrupa las x a un lado y los números al otro.",level:3,type:"Ecuación de varios pasos",points:30},
    {eq:"3(x + 2) = x + 14",answer:4,hint:"Aplica la distributiva y reúne términos semejantes.",level:3,type:"Propiedad distributiva",points:30},
    {eq:"5(x - 1) = 3x + 9",answer:7,hint:"Desarrolla el paréntesis y despeja x.",level:3,type:"Ecuación de varios pasos",points:30},
    {eq:"2x + 8 = 5x - 7",answer:5,hint:"Resta 2x y suma 7 en ambos miembros.",level:3,type:"Incógnita en ambos miembros",points:30}
  ];

  function loadData() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        students: parsed.students && typeof parsed.students === "object" ? parsed.students : {},
        custom: Array.isArray(parsed.custom) ? parsed.custom : []
      };
    } catch (_) { return {students:{},custom:[]}; }
  }
  let data = loadData();
  function saveData() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (_) { alert("No se pudo guardar el progreso en este dispositivo. Revisa el almacenamiento del navegador."); }
  }
  function getStudent(name) {
    if (!data.students[name]) data.students[name] = {points:0,correct:0,attempts:0};
    return data.students[name];
  }
  function safeText(value) {
    return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function chooseRole(role) {
    state.role = role;
    document.querySelectorAll(".role-option").forEach(btn => btn.classList.toggle("selected",btn.dataset.role === role));
  }
  function enterApp() {
    const name = $("userName").value.trim();
    if (!name) { $("userName").focus(); $("userName").setCustomValidity("Escribe tu nombre para continuar."); $("userName").reportValidity(); return; }
    $("userName").setCustomValidity("");
    state.name = name;
    $("welcomeView").hidden = true; $("appView").hidden = false;
    $("sidebarName").textContent = name; $("avatar").textContent = name.charAt(0).toUpperCase();
    $("sidebarRole").textContent = state.role === "teacher" ? "Profesor" : "Estudiante";
    document.querySelectorAll(".teacher-only").forEach(el => el.hidden = state.role !== "teacher");
    $("todayLabel").textContent = new Intl.DateTimeFormat("es-EC",{dateStyle:"medium"}).format(new Date());
    if (state.role === "teacher") { showPage("dashboard"); renderTeacher(); }
    else { getStudent(name); saveData(); showPage("dashboard"); renderStudent(); }
  }
  function showPage(page) {
    state.page = page;
    $("studentDashboard").hidden = !(state.role === "student" && page === "dashboard");
    $("challengePage").hidden = !(state.role === "student" && page === "challenges");
    $("teacherDashboard").hidden = !(state.role === "teacher" && page === "dashboard");
    $("classroomPage").hidden = !(state.role === "teacher" && page === "classroom");
    document.querySelectorAll(".nav-item[data-page]").forEach(btn => btn.classList.toggle("active",btn.dataset.page === page));
    const titles = state.role === "teacher" ? {dashboard:"Panel del profesor",classroom:"Gestión de retos"} : {dashboard:"¡Hola, "+state.name+"!",challenges:"Zona de desafíos"};
    $("pageTitle").textContent = titles[page] || "Equation Challenge";
    $("pageEyebrow").textContent = state.role === "teacher" ? "GESTIÓN Y SEGUIMIENTO" : "TU ESPACIO DE APRENDIZAJE";
    if (page === "classroom") renderCustomList();
  }
  function renderStudent() {
    const s = getStudent(state.name);
    $("totalPoints").textContent = s.points;
    $("correctCount").textContent = s.correct;
    $("accuracy").textContent = s.attempts ? Math.round(s.correct/s.attempts*100)+"%" : "0%";
    $("levelCards").innerHTML = levels.map((l,i)=>`<div class="level-card"><span class="level-num">0${i+1}</span><div><strong>${l.name}</strong><small>${l.desc}</small></div><span class="level-action">${l.count} retos</span></div>`).join("");
  }
  function renderTeacher() {
    const students = Object.entries(data.students);
    const totalCorrect = students.reduce((a,[,s])=>a+s.correct,0);
    const totalPoints = students.reduce((a,[,s])=>a+s.points,0);
    $("studentTotal").textContent = students.length;
    $("classCorrect").textContent = totalCorrect;
    $("classPoints").textContent = totalPoints;
    $("studentTable").innerHTML = students.length ? students.map(([name,s])=>`<tr><td><strong>${safeText(name)}</strong></td><td>${s.correct}</td><td>${s.points}</td><td>${s.attempts?Math.round(s.correct/s.attempts*100):0}%</td></tr>`).join("") : '<tr><td colspan="4" class="empty-cell">Aún no hay estudiantes registrados.</td></tr>';
  }
  function startSession() {
    state.currentQuestions = [...bank, ...data.custom.map(q=>({...q,level:2,points:20,type:"Reto del profesor"}))];
    state.currentQuestions.sort((a,b)=>a.level-b.level);
    state.index = 0; state.sessionCorrect = 0; state.sessionPoints = 0; state.answered = false;
    showPage("challenges"); renderQuestion();
  }
  function renderQuestion() {
    const q = state.currentQuestions[state.index];
    if (!q) { finishSession(); return; }
    $("questionCounter").textContent = `RETO ${state.index+1} / ${state.currentQuestions.length}`;
    $("questionProgress").style.width = `${(state.index/state.currentQuestions.length)*100}%`;
    $("levelTag").textContent = `NIVEL ${q.level}`;
    $("questionType").textContent = q.type;
    $("equationDisplay").textContent = q.eq;
    $("answerInput").value = ""; $("answerInput").disabled = false;
    $("feedback").textContent = ""; $("feedback").className = "feedback";
    $("hintBox").hidden = true; $("hintBox").textContent = "";
    $("hintBtn").disabled = false;
    $("pointsPossible").textContent = `+${q.points} puntos`;
    $("sessionCorrect").textContent = `${state.sessionCorrect} / ${state.index}`;
    $("sessionPoints").textContent = state.sessionPoints;
    $("nextQuestionBtn").hidden = true; $("finishSessionBtn").hidden = true;
    $("answerForm").querySelector("button").disabled = false;
    state.answered = false;
  }
  function submitAnswer(event) {
    event.preventDefault();
    if (state.answered) return;
    const raw = $("answerInput").value.trim();
    if (!raw) return;
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    const q = state.currentQuestions[state.index];
    const correct = Math.abs(value-q.answer) < 0.000001;
    const student = getStudent(state.name);
    student.attempts += 1;
    if (correct) {
      student.correct += 1; student.points += q.points;
      state.sessionCorrect += 1; state.sessionPoints += q.points;
      $("feedback").textContent = `¡Excelente, ${state.name}! La respuesta es correcta. +${q.points} puntos.`;
      $("feedback").className = "feedback good";
    } else {
      $("feedback").textContent = `Aún no es correcto. La respuesta esperada es ${q.answer}. Revisa los pasos e inténtalo en el próximo reto.`;
      $("feedback").className = "feedback bad";
    }
    saveData(); state.answered = true;
    $("answerInput").disabled = true; $("answerForm").querySelector("button").disabled = true;
    $("hintBtn").disabled = true;
    $("sessionCorrect").textContent = `${state.sessionCorrect} / ${state.index+1}`;
    $("sessionPoints").textContent = state.sessionPoints;
    $("questionProgress").style.width = `${((state.index+1)/state.currentQuestions.length)*100}%`;
    if (state.index < state.currentQuestions.length-1) $("nextQuestionBtn").hidden = false;
    else $("finishSessionBtn").hidden = false;
  }
  function nextQuestion() { state.index++; renderQuestion(); }
  function finishSession() {
    showPage("dashboard"); renderStudent();
    $("pageTitle").textContent = "¡Reto completado!";
    $("pageEyebrow").textContent = "RESULTADO DE TU SESIÓN";
    $("studentDashboard").insertAdjacentHTML("afterbegin",`<div class="panel" style="margin-bottom:16px"><strong>¡Buen trabajo, ${safeText(state.name)}!</strong><p class="subtle">Has respondido ${state.index+1} ejercicios, con ${state.sessionCorrect} respuestas correctas y ${state.sessionPoints} puntos obtenidos en esta sesión.</p></div>`);
  }
  function showHint() {
    const q = state.currentQuestions[state.index];
    $("hintBox").textContent = "Pista: "+q.hint;
    $("hintBox").hidden = false;
  }
  function addCustomQuestion(event) {
    event.preventDefault();
    const eq = $("customEquation").value.trim();
    const answer = Number($("customAnswer").value);
    const hint = $("customHint").value.trim() || "Aplica operaciones inversas en ambos miembros.";
    if (!eq || !Number.isFinite(answer)) return;
    if (!/[xX]/.test(eq) || !eq.includes("=")) {
      $("customFeedback").textContent = "Escribe una ecuación que contenga x y el signo igual (=)."; return;
    }
    data.custom.push({eq,answer,hint,level:2,points:20,type:"Reto personalizado"});
    saveData(); $("customQuestionForm").reset();
    $("customFeedback").textContent = "Reto guardado correctamente en este dispositivo.";
    renderCustomList();
  }
  function renderCustomList() {
    $("customQuestionList").innerHTML = data.custom.length ? data.custom.map((q,i)=>`<div class="custom-item"><div><strong>${safeText(q.eq)}</strong><br><small>Respuesta: ${q.answer} · ${safeText(q.hint)}</small></div><button class="delete-custom" data-delete="${i}" type="button">Eliminar</button></div>`).join("") : '<p class="empty-cell">Todavía no se han creado retos personalizados.</p>';
  }
  function deleteCustom(index) { data.custom.splice(index,1); saveData(); renderCustomList(); }
  document.querySelectorAll(".role-option").forEach(btn=>btn.addEventListener("click",()=>chooseRole(btn.dataset.role)));
  $("enterBtn").addEventListener("click",enterApp);
  $("userName").addEventListener("keydown",e=>{if(e.key==="Enter")enterApp();});
  $("logoutBtn").addEventListener("click",()=>{ $("appView").hidden=true; $("welcomeView").hidden=false; $("userName").value=""; chooseRole("student"); });
  document.querySelectorAll(".nav-item[data-page]").forEach(btn=>btn.addEventListener("click",()=>{showPage(btn.dataset.page);if(state.role==="teacher"&&btn.dataset.page==="dashboard")renderTeacher();if(state.role==="student"&&btn.dataset.page==="dashboard")renderStudent();}));
  $("startChallengeBtn").addEventListener("click",startSession);
  $("answerForm").addEventListener("submit",submitAnswer);
  $("nextQuestionBtn").addEventListener("click",nextQuestion);
  $("finishSessionBtn").addEventListener("click",finishSession);
  $("hintBtn").addEventListener("click",showHint);
  $("customQuestionForm").addEventListener("submit",addCustomQuestion);
  $("customQuestionList").addEventListener("click",e=>{const b=e.target.closest("[data-delete]");if(b)deleteCustom(Number(b.dataset.delete));});
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(err=>console.warn("No se pudo registrar el modo sin conexión:",err)));
  }
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false;});
  $("installBtn").addEventListener("click",async()=>{if(!deferredPrompt){alert("En iPhone: abre Compartir en Safari y selecciona «Añadir a pantalla de inicio».");return;}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true;});
})();