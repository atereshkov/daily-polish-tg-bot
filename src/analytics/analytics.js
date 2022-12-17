import * as Amplitude from '@amplitude/node';

const client = Amplitude.init('b333dd055f49f7694d079c989b56d6eb');

export function trackWordQuizShowed(tgId, word) {
  client.logEvent({
      event_type: 'Word Showed',
      user_id: `${tgId}`,
      event_properties: {
        word: word
      }
    });
}

export function trackWordQuizAnswered(tgId, isRight, word) {
    client.logEvent({
        event_type: 'Word Answered',
        user_id: `${tgId}`,
        event_properties: {
          word: word,
          rightAnswer: isRight
        }
      });
}

export function trackLanguageSelected(tgId, languageCode) {
  client.logEvent({
      event_type: 'Language Selected',
      user_id: `${tgId}`,
      event_properties: {
        languageCode: languageCode
      }
    });
}

export function trackWordAdded(tgId, word) {
  client.logEvent({
      event_type: 'Word Added',
      user_id: `${tgId}`,
      event_properties: {
        word: word
      }
    });
}