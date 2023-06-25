// Initialize Firebase
var firebaseConfig = {
    // Replace with your Firebase project configuration
    apiKey: "AIzaSyAajQKG32ON41pfikoPuhgbknQ5sbfCChg",
    authDomain: "digitalmalls.firebaseapp.com",
    databaseURL: "https://digitalmalls-default-rtdb.firebaseio.com",
    projectId: "digitalmalls",
    storageBucket: "digitalmalls.appspot.com",
    messagingSenderId: "637307289359",
    appId: "1:637307289359:web:77bcc36b293ccee4ba887a",
    measurementId: "G-6EZD23E4K5"
  };
  
  firebase.initializeApp(firebaseConfig);
  var auth = firebase.auth();
  var database = firebase.database();
  // Initialize QR code generator
var qrcode;
  
  // Get login form element
  var loginForm = document.getElementById('login-form');
  // Get form container element
  var formContainer = document.getElementById('form-container');
  // Get data form element
  var dataForm = document.getElementById('data-form');
  // Get store name input element
  var storeNameInput = document.getElementById('store-name');
  // Get coupon code container element
  var couponCodeContainer = document.getElementById('coupon-code');
  
  // Global variable for sequential number
  var currentSequentialNumber = 0;
  
  // Listen for form submit event
  loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
  
    // Get user input
    var email = loginForm.email.value;
    var password = loginForm.password.value;
  
    // Sign in with email and password
    auth.signInWithEmailAndPassword(email, password)
      .then(function(userCredential) {
        // Login successful
        loginForm.reset();
        getStoreNameByEmail(email, function(storeName) {
          if (storeName) {
            storeNameInput.value = storeName; // Set store name input value
            showForm();
          } else {
            alert('Store name not found.');
          }
        });
      })
      .catch(function(error) {
        alert('Error logging in: ' + error.message);
      });
  });
  
  // Show the form
  function showForm() {
    loginForm.style.display = 'none';
    formContainer.style.display = 'block';
  }
  
  // Get store name from the database using email
  function getStoreNameByEmail(value, callback) {
    const registrationsRef = database.ref('vendor_registrations');
  
    registrationsRef.once('value')
      .then(snapshot => {
        snapshot.forEach(storeSnapshot => {
          storeSnapshot.forEach(nameSnapshot => {
            const data = nameSnapshot.val();
            if (data.email === value || data.name === value || data.storeName === value) {
              const storeName = data.storeName;
              console.log('Value found:', data);
              callback(storeName);
            }
          });
        });
      })
      .catch(error => {
        console.error('Error searching for value:', error);
      });
  }
  
// Listen for data form submit event
dataForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
  
    // Get user input
    var storeName = storeNameInput.value;
    var product = dataForm.product.value;
    var amount = dataForm.amount.value;
  
  // Generate coupon code
  generateCouponCode(storeName, amount)
    .then(function(couponCode) {
      // Display the coupon code
      var redeemText = 'Redeem this code at: digitalmall.in/offers/' + couponCode;
      couponCodeContainer.textContent = couponCode + '\n' + redeemText;

     // Generate the QR code
     var qrCodeContainer = document.getElementById('qrcode-container');
      qrCodeContainer.innerHTML = ''; // Clear the container before generating a new QR code
      qrcode = new QRCode(qrCodeContainer, {
        text: 'https://digitalmall.in/offers/' + couponCode,
        width: 128,
        height: 128
      });

      // Save the data to the database
      var userRef = database.ref('coupons&data/' + storeName).push();
      userRef.set({
        storeName: storeName,
        product: product,
        amount: amount,
        couponCode: couponCode
      })
        .then(function() {
            dataForm.product.value = '';
            dataForm.amount.value = '';
        })
        .catch(function(error) {
          alert('Error saving data: ' + error.message);
        });
    })
    .catch(function(error) {
      alert('Error generating coupon code: ' + error.message);
    });
});
  
  // Generate coupon code
  function generateCouponCode(storeName, amount) {
    return new Promise(function(resolve, reject) {
      var trackNumberRef = database.ref('coupon_track_numbers/' + storeName);
      trackNumberRef.transaction(function(trackNumber) {
        if (trackNumber === null) {
          return 1;
        } else {
          return trackNumber + 1;
        }
      }, function(error, committed, snapshot) {
        if (error) {
          reject(error);
        } else if (!committed) {
          reject(new Error('Failed to increment track number.'));
        } else {
          var trackNumber = snapshot.val();
          var couponCode = trackNumber.toString().padStart(4, '0') + '_' + storeName + '_' + amount;
          resolve(couponCode);
        }
      });
    });
  }
  