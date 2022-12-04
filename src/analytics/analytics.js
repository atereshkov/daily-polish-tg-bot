import * as Amplitude from '@amplitude/node';

const client = Amplitude.init('b333dd055f49f7694d079c989b56d6eb');

export function track(tgId) {
    client.logEvent({
        event_type: 'Test Event',
        user_id: `${tgId}`,
        event_properties: {
          keyString: 'valueString',
          keyInt: 11,
          keyBool: true
        }
      });
}