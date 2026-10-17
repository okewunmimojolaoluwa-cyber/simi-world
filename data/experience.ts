// THE BOX I NEVER SENT
// All content for the experience

export const EXPERIENCE = {
  // Her information
  recipient: {
    name: "Roqeebat",
    birthday: "October 25"
  },

  // Opening scene
  opening: {
    title: "FOR ROQEEBAT",
    subtitle: "I made something.",
    instruction: "Open it."
  },

  // Memory objects that float from the box
  memories: [
    {
      id: "photo-1",
      type: "photograph",
      image: "/images/memories/1.jpg",
      caption: "I still remember this.",
      date: "Summer",
      position: { x: -20, y: -15 }
    },
    {
      id: "note-1",
      type: "note",
      content: "Some moments don't need words.",
      position: { x: 15, y: -10 }
    },
    {
      id: "clock-1",
      type: "clock",
      time: "3:47 PM",
      memory: "The moment everything felt right.",
      date: "A Thursday",
      position: { x: -10, y: 20 }
    },
    {
      id: "photo-2",
      type: "photograph",
      image: "/images/memories/2.jpg",
      caption: "You looked so happy here.",
      date: "That day in the United Kingdom",
      position: { x: 20, y: 15 }
    },
    {
      id: "fragment-1",
      type: "fragment",
      content: "Your laugh.",
      position: { x: 0, y: -25 }
    }
  ],

  // Timeline moments
  timeline: [
    {
      date: "The Beginning",
      text: "When we first met",
      image: "/images/timeline/1.jpg"
    },
    {
      date: "Early Days",
      text: "Learning about you",
      image: "/images/timeline/2.jpg"
    },
    {
      date: "Growing Closer",
      text: "Inside jokes and shared moments",
      image: "/images/timeline/3.jpg"
    },
    {
      date: "Now",
      text: "Here we are",
      image: "/images/timeline/4.jpg"
    }
  ],

  // Things never said
  unsentNotes: [
    "I appreciated you more than I knew how to say.",
    "You became part of some of my favorite memories.",
    "Your smile stayed with me longer than you know.",
    "I hope life is kind to you.",
    "Thank you for every moment.",
    "You made ordinary days feel special."
  ],

  // Photo room
  photoWall: [
    {
      id: 1,
      url: "/images/gallery/photo1.jpg",
      rotation: -3,
      x: 10,
      y: 15,
      scale: 0.9
    },
    {
      id: 2,
      url: "/images/gallery/photo2.jpg",
      rotation: 2,
      x: 35,
      y: 10,
      scale: 1.0
    },
    {
      id: 3,
      url: "/images/gallery/photo3.jpg",
      rotation: -1,
      x: 60,
      y: 20,
      scale: 0.95
    },
    {
      id: 4,
      url: "/images/gallery/photo4.jpg",
      rotation: 4,
      x: 15,
      y: 55,
      scale: 1.1
    },
    {
      id: 5,
      url: "/images/gallery/photo5.jpg",
      rotation: -2,
      x: 45,
      y: 50,
      scale: 0.85
    },
    {
      id: 6,
      url: "/images/gallery/photo6.jpg",
      rotation: 1,
      x: 70,
      y: 60,
      scale: 1.0
    },
    {
      id: 7,
      url: "/images/gallery/photo7.jpg",
      rotation: -4,
      x: 25,
      y: 85,
      scale: 0.9
    },
    {
      id: 8,
      url: "/images/gallery/photo8.jpg",
      rotation: 3,
      x: 55,
      y: 90,
      scale: 1.05
    }
  ],

  // Birthday moment
  birthday: {
    beforeWish: "Before you go...",
    wishPrompt: "Make a wish.",
    reveal: "HAPPY BIRTHDAY",
    name: "ROQEEBAT"
  },

  // The letter - CUSTOMIZE THIS
  letter: {
    paragraphs: [
      "I wanted to create something different for your birthday.",
      "Not just another message, but a space where some of my favorite memories of us could exist.",
      "You've been part of moments I'll always remember.",
      "Your energy, your laugh, the way you see the world—all of it made things brighter.",
      "I hope this year brings you everything you're hoping for.",
      "Thank you for being exactly who you are."
    ]
  },

  // Closing
  closing: {
    line1: "Some things don't need an ending.",
    line2: "Happy Birthday.",
    signature: "— from me"
  }
};
