(function () {
"use strict";

const health = {
  vaccination: "a confirmar com o responsável",
  neutering: "a confirmar com o responsável"
};

const extraPets = [
  {
    id: "extra-thor",
    name: "Thor",
    species: "dog",
    sex: "Macho",
    ageMonths: 8,
    size: "medium",
    breed: "Sem raça definida",
    city: "Botucatu, SP",
    personality: ["Brincalhão", "Curioso", "Energético"],
    story: "Thor adora correr atrás de bolinhas e fazer amizade com todo mundo que encontra no caminho.",
    needs: "Precisa de passeios diários, brinquedos e uma rotina de treino carinhosa.",
    health,
    guardian: "Responsável a confirmar",
    image: "img/pets/dog1.jpg",
    images: ["img/pets/dog1.jpg"]
  },

  {
    id: "extra-mel",
    name: "Mel",
    species: "dog",
    sex: "Fêmea",
    ageMonths: 36,
    size: "small",
    breed: "Sem raça definida",
    city: "Botucatu, SP",
    personality: ["Carinhosa", "Calma", "Companheira"],
    story: "Mel é do tipo que deita no seu pé e fica ali, fazendo companhia o dia inteiro.",
    needs: "Gosta de ambientes tranquilos e de rotina previsível.",
    health,
    guardian: "Responsável a confirmar",
    image: "img/pets/dog2.jpg",
    images: ["img/pets/dog2.jpg"]
  },

  {
    id: "extra-bob",
    name: "Bob",
    species: "dog",
    sex: "Macho",
    ageMonths: 60,
    size: "large",
    breed: "Sem raça definida",
    city: "Botucatu, SP",
    personality: ["Leal", "Protetor", "Dócil"],
    story: "Bob é grandão e gentil, ótimo para quem tem espaço e gosta de caminhadas longas.",
    needs: "Espaço para se movimentar e passeios regulares.",
    health,
    guardian: "Responsável a confirmar",
    image: "img/pets/dog3.jpg",
    images: ["img/pets/dog3.jpg"]
  },

  {
    id: "extra-pipoca",
    name: "Pipoca",
    species: "dog",
    sex: "Fêmea",
    ageMonths: 132,
    size: "small",
    breed: "Sem raça definida",
    city: "Botucatu, SP",
    personality: ["Tranquila", "Meiga", "Sonhadora"],
    story: "Pipoca já viveu muita coisa e agora só quer um colinho quentinho para aposentar as aventuras.",
    needs: "Acompanhamento veterinário regular e uma caminha confortável.",
    health,
    guardian: "Responsável a confirmar",
    image: "img/pets/dog4.jpg",
    images: ["img/pets/dog4.jpg"]
  },

  {
    id: "extra-luna",
    name: "Luna",
    species: "cat",
    sex: "Fêmea",
    ageMonths: 5,
    size: "small",
    breed: "Sem raça definida",
    city: "Botucatu, SP",
    personality: ["Travessa", "Curiosa", "Ágil"],
    story: "Luna explora cada cantinho da casa e transforma qualquer barbante em diversão.",
    needs: "Arranhadores, brinquedos e janelas protegidas com tela.",
    health,
    guardian: "Responsável a confirmar",
    image: "img/pets/gato1.jpg",
    images: ["img/pets/gato1.jpg"]
  },

  {
    id: "extra-simba",
    name: "Simba",
    species: "cat",
    sex: "Macho",
    ageMonths: 24,
    size: "medium",
    breed: "Sem raça definida",
    city: "Botucatu, SP",
    personality: ["Corajoso", "Sociável", "Dorminhoco"],
    story: "Simba se dá bem com visitas e adora um raio de sol para tirar a soneca da tarde.",
    needs: "Ração de qualidade, caixa de areia limpa e carinho diário.",
    health,
    guardian: "Responsável a confirmar",
    image: "img/pets/gato2.jpg",
    images: ["img/pets/gato2.jpg"]
  },

  {
    id: "extra-nina",
    name: "Nina",
    species: "cat",
    sex: "Fêmea",
    ageMonths: 48,
    size: "small",
    breed: "Sem raça definida",
    city: "Botucatu, SP",
    personality: ["Reservada", "Doce", "Observadora"],
    story: "Nina leva um tempinho para confiar, mas depois vira a companheira mais fiel do sofá.",
    needs: "Paciência na adaptação e um cantinho só dela no início.",
    health,
    guardian: "Responsável a confirmar",
    image: "img/pets/gato3.jpg",
    images: ["img/pets/gato3.jpg"]
  },

  {
    id: "extra-tom",
    name: "Tom",
    species: "cat",
    sex: "Macho",
    ageMonths: 120,
    size: "medium",
    breed: "Sem raça definida",
    city: "Botucatu, SP",
    personality: ["Sereno", "Afetuoso", "Experiente"],
    story: "Tom é um gentleman: ronrona alto, não pede muito e retribui cada carinho em dobro.",
    needs: "Check-ups veterinários frequentes e rotina tranquila.",
    health,
    guardian: "Responsável a confirmar",
    image: "img/pets/gato4.jpg",
    images: ["img/pets/gato4.jpg"]
  }
];
window.extraPets = extraPets;
})();