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
  
  
  document.addEventListener('DOMContentLoaded', function() {
    // Get enroll form element
    var enrollForm = document.getElementById('enroll-form');
  
    // Listen for form submit event
    enrollForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent form submission
  
      // Get user input
      var name = enrollForm.name.value;
      var email = enrollForm.email.value;
      var storeName = enrollForm['store-name'].value;
      var password = enrollForm.password.value;
  
      // Create user with email and password
      auth.createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
          // User creation successful
          var user = userCredential.user;
          var uid = user.uid;
  
          // Save user details to the database
          var userRef = database.ref('vendor_registrations/' + storeName+'/'+name);
          userRef.set({
            name: name,
            email: email,
            storeName: storeName
          })
            .then(function() {
              alert('Enrollment successful!');
              enrollForm.reset();
            })
            .catch(function(error) {
              alert('Error enrolling user: ' + error.message);
            });
        })
        .catch(function(error) {
          alert('Error creating user: ' + error.message);
        });
    });
  });
  