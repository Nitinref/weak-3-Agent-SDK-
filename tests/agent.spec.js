import { test } from '@playwright/test';
import { automation } from '../assignment.js';

test('Run my automation agent', async ({}, testInfo) => {
  test.setTimeout(180000); // ⏰ 2 minutes timeout

  const { chatWithAgent } = await automation();
  await chatWithAgent(`Go to https://ui.chaicode.com/  move to the signup section do signup with the {email} , {password },{Firstname} and {Lastname} provided below
    where
    - email='openai454@gmail.com' 
    - password='justfortesting45'
    - Firstname='nitin' 
    - Lastname='yadav'
  `);
});
