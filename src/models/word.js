class Word {
    constructor(id, origin, translations, rightTranslation) {
      this.id = id;
      this.origin = origin;
      this.translations = translations;
      this.rightTranslation = rightTranslation;
    }

    isRightTranslation(translation) {
      return this.rightTranslation == translation;
    }
}

export default Word;