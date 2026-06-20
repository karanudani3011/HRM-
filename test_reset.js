const API_KEY = 'AIzaSyA59_9MaPWfQbnwEb8_Bf92f8tEx6lfV5c';
const email = 'director@hrmconsultancydoctorschoices.com';

async function test() {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestType: 'PASSWORD_RESET',
        email: email,
        returnOobLink: true
      }),
    });
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
