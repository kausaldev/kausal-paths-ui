import 'i18next';
import type nsCommon from '../../public/locales/en/common.json';

import * as NextI18Next from 'next-i18next';
import numbro from 'numbro';
import numbroEnGb from 'numbro/dist/languages/en-GB.min.js';
import numbroFi from 'numbro/dist/languages/fi-FI.min.js';
import numbroDe from 'numbro/dist/languages/de-DE.min.js';
import numbroDeCh from 'numbro/dist/languages/de-CH.min.js';
import numbroCs from 'numbro/dist/languages/cs-CZ.min.js';
import numbroDa from 'numbro/dist/languages/da-DK.min.js';
import numbroLv from 'numbro/dist/languages/lv-LV.min.js';
import numbroPl from 'numbro/dist/languages/pl-PL.min.js';

const numbroLangs = {
  de: numbroDe,
  'de-DE': numbroDe,
  'de-CH': numbroDeCh,
  'en-GB': numbroEnGb,
  fi: numbroFi,
  cs: numbroCs,
  da: numbroDa,
  lv: numbroLv,
  pl: numbroPl,
};

Object.entries(numbroLangs).forEach(([lang, conf]) => {
  numbro.registerLanguage({
    ...conf,
    languageTag: lang,
  });
});

const { appWithTranslation, withTranslation, Trans, useTranslation } =
  NextI18Next;

export function getI18n() {
  return NextI18Next.i18n;
}

export { appWithTranslation, withTranslation, Trans, useTranslation };

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: 'common';
    // custom resources type
    resources: {
      common: typeof nsCommon;
    };
    // other
  }
}
