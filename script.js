document.addEventListener("DOMContentLoaded", () => {
  // Quiz questions
  const questions = [
    {
      question: "O que significa HTML?",
      options: [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Hyper Transfer Markup Language",
        "Home Tool Markup Language",
      ],
      correctAnswer: 0,
      userAnswer: null,
    },
    {
      question: "Qual propriedade CSS é usada para alterar a cor do texto?",
      options: ["text-style", "font-color", "color", "text-color"],
      correctAnswer: 2,
      userAnswer: null,
    },
    {
      question: "Qual é a forma correta de selecionar um elemento com id 'demo' em CSS?",
      options: [".demo", "#demo", "demo", "*demo"],
      correctAnswer: 1,
      userAnswer: null,
    },
    {
      question: "Qual método JavaScript é usado para selecionar um elemento HTML pelo seu id?",
      options: [
        "document.querySelector()",
        "document.getElement()",
        "document.getElementById()",
        "document.findElement()",
      ],
      correctAnswer: 2,
      userAnswer: null,
    },
    {
      question: "Qual framework CSS é conhecido por seu sistema de grid responsivo de 12 colunas?",
      options: ["Tailwind CSS", "Bootstrap", "Bulma", "Foundation"],
      correctAnswer: 1,
      userAnswer: null,
    },
    {
      question: "Qual símbolo é usado para começar um comentário de uma linha em JavaScript?",
      options: ["//", "/* */", "#", "--"],
      correctAnswer: 0,
      userAnswer: null,
    },
    {
      question:
        "Qual propriedade CSS é usada para criar espaço ao redor de elementos, fora de qualquer borda definida?",
      options: ["spacing", "margin", "padding", "border-spacing"],
      correctAnswer: 1,
      userAnswer: null,
    },
    {
      question: "Qual é a função do atributo 'viewport' na tag meta?",
      options: [
        "Definir o título da página",
        "Controlar o layout em dispositivos móveis",
        "Melhorar o SEO da página",
        "Definir o idioma da página",
      ],
      correctAnswer: 1,
      userAnswer: null,
    },
    {
      question: "Qual é o valor padrão da propriedade 'position' em CSS?",
      options: ["relative", "absolute", "fixed", "static"],
      correctAnswer: 3,
      userAnswer: null,
    },
    {
      question: "Qual método JavaScript é usado para adicionar um novo elemento ao final de um array?",
      options: ["push()", "append()", "addToEnd()", "insert()"],
      correctAnswer: 0,
      userAnswer: null,
    },
  ]

  // DOM elements
  const quizContainer = document.getElementById("quizContainer")
  const progressIndicator = document.getElementById("progressIndicator")
  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")
  const currentQuestionIndicator = document.getElementById("currentQuestionIndicator")
  const totalQuestionsIndicator = document.getElementById("totalQuestionsIndicator")
  const swipeLeft = document.getElementById("swipeLeft")
  const swipeRight = document.getElementById("swipeRight")
  const resultModal = document.getElementById("resultModal")
  const correctAnswers = document.getElementById("correctAnswers")
  const restartBtn = document.getElementById("restartBtn")
  const themeToggle = document.getElementById("themeToggle")

  // Quiz state
  let currentQuestionIndex = 0
  let isDragging = false
  let startX = 0
  let currentX = 0
  let questionCards = []

  // Initialize the quiz
  function initQuiz() {
    // Create progress dots
    progressIndicator.innerHTML = ""
    for (let i = 0; i < questions.length; i++) {
      const dot = document.createElement("div")
      dot.className = "progress-dot"
      if (i === 0) dot.classList.add("active")
      progressIndicator.appendChild(dot)
    }

    // Create question cards
    quizContainer.innerHTML = ""
    questionCards = []

    questions.forEach((question, index) => {
      const card = document.createElement("div")
      card.className = "question-card p-4"
      card.style.transform = `translateX(${(index - currentQuestionIndex) * 100}%)`

      let optionsHTML = ""
      question.options.forEach((option, optionIndex) => {
        optionsHTML += `
          <div class="option mb-3 p-4 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition-colors" 
               data-index="${optionIndex}">
            ${option}
          </div>
        `
      })

      card.innerHTML = `
        <h2 class="text-xl font-bold mb-6">${question.question}</h2>
        <div class="options">
          ${optionsHTML}
        </div>
      `

      quizContainer.appendChild(card)
      questionCards.push(card)

      // Add event listeners to options
      const options = card.querySelectorAll(".option")
      options.forEach((option) => {
        option.addEventListener("click", () => {
          selectOption(index, Number.parseInt(option.dataset.index))
        })
      })
    })

    // Update indicators
    updateQuestionIndicator()
    updateButtonStates()
    updateProgressDots()

    // Add swipe event listeners
    quizContainer.addEventListener("mousedown", startDrag)
    quizContainer.addEventListener("mousemove", drag)
    quizContainer.addEventListener("mouseup", endDrag)
    quizContainer.addEventListener("mouseleave", endDrag)
    quizContainer.addEventListener("touchstart", startDrag)
    quizContainer.addEventListener("touchmove", drag)
    quizContainer.addEventListener("touchend", endDrag)
  }

  // Handle option selection
  function selectOption(questionIndex, optionIndex) {
    const question = questions[questionIndex]
    question.userAnswer = optionIndex

    // Update UI
    const card = questionCards[questionIndex]
    const options = card.querySelectorAll(".option")

    options.forEach((option, index) => {
      option.classList.remove("option-selected", "option-correct", "option-incorrect")

      if (index === optionIndex) {
        option.classList.add("option-selected")

        // If it's the current question, show feedback
        if (questionIndex === currentQuestionIndex) {
          if (index === question.correctAnswer) {
            option.classList.add("option-correct")
          } else {
            option.classList.add("option-incorrect")
            options[question.correctAnswer].classList.add("option-correct")
          }
        }
      }
    })

    updateProgressDots()

    // Auto advance to next question after a short delay
    if (questionIndex === currentQuestionIndex && currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        goToNextQuestion()
      }, 1000)
    }

    // Check if all questions are answered
    checkQuizCompletion()
  }

  // Navigation functions
  function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--
      updateCardPositions()
      updateQuestionIndicator()
      updateButtonStates()
      updateProgressDots()
    }
  }

  function goToNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++
      updateCardPositions()
      updateQuestionIndicator()
      updateButtonStates()
      updateProgressDots()
    }
  }

  function updateCardPositions() {
    questionCards.forEach((card, index) => {
      card.style.transform = `translateX(${(index - currentQuestionIndex) * 100}%)`
    })
  }

  function updateQuestionIndicator() {
    currentQuestionIndicator.textContent = currentQuestionIndex + 1
    totalQuestionsIndicator.textContent = questions.length
  }

  function updateButtonStates() {
    prevBtn.disabled = currentQuestionIndex === 0
    nextBtn.disabled = currentQuestionIndex === questions.length - 1
  }

  function updateProgressDots() {
    const dots = progressIndicator.querySelectorAll(".progress-dot")
    dots.forEach((dot, index) => {
      dot.classList.remove("active", "answered")

      if (index === currentQuestionIndex) {
        dot.classList.add("active")
      }

      if (questions[index].userAnswer !== null) {
        dot.classList.add("answered")
      }
    })
  }

  // Drag/swipe functionality
  function startDrag(e) {
    isDragging = true
    startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX
    currentX = startX

    quizContainer.style.cursor = "grabbing"
  }

  function drag(e) {
    if (!isDragging) return

    const x = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX
    const diff = x - startX
    currentX = x

    // Show swipe indicators
    if (diff < 0 && currentQuestionIndex < questions.length - 1) {
      swipeRight.style.opacity = Math.min(Math.abs(diff) / 100, 0.8)
    } else if (diff > 0 && currentQuestionIndex > 0) {
      swipeLeft.style.opacity = Math.min(Math.abs(diff) / 100, 0.8)
    }

    // Move cards with drag
    questionCards.forEach((card, index) => {
      const offset = (index - currentQuestionIndex) * 100
      card.style.transform = `translateX(calc(${offset}% + ${diff}px))`
    })
  }

  function endDrag(e) {
    if (!isDragging) return
    isDragging = false

    const diff = currentX - startX
    const threshold = quizContainer.offsetWidth * 0.2 // 20% of container width

    // Hide swipe indicators
    swipeLeft.style.opacity = 0
    swipeRight.style.opacity = 0

    quizContainer.style.cursor = "default"

    // Determine if we should change question
    if (diff < -threshold && currentQuestionIndex < questions.length - 1) {
      goToNextQuestion()
    } else if (diff > threshold && currentQuestionIndex > 0) {
      goToPreviousQuestion()
    } else {
      // Snap back to original position
      updateCardPositions()
    }
  }

  // Check if all questions are answered
  function checkQuizCompletion() {
    const allAnswered = questions.every((q) => q.userAnswer !== null)
    if (allAnswered) {
      const correct = questions.filter((q) => q.userAnswer === q.correctAnswer).length
      correctAnswers.textContent = correct
      resultModal.classList.add("modal-open")
    }
  }

  // Theme toggle
  themeToggle.addEventListener("change", () => {
    document.documentElement.setAttribute("data-theme", themeToggle.checked ? "dark" : "light")
  })

  // Set dark theme as default
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.setAttribute("data-theme", "dark")
    themeToggle.checked = true
  }

  // Button event listeners
  prevBtn.addEventListener("click", goToPreviousQuestion)
  nextBtn.addEventListener("click", goToNextQuestion)
  restartBtn.addEventListener("click", () => {
    // Reset quiz state
    currentQuestionIndex = 0
    questions.forEach((q) => (q.userAnswer = null))
    resultModal.classList.remove("modal-open")
    initQuiz()
  })

  // Initialize the quiz
  initQuiz()
})

