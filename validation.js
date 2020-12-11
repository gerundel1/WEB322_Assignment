module.exports.validateUserForm = function(formData) {
    var errors = {isValid: true, firstName: "", lastName: "", email: "", password: ""};
    validateFirstName(formData.firstName, errors);
    validateLastName(formData.lastName, errors);
    validateEmail(formData.email, errors);
    validatePassword(formData.password, errors);
    return errors;
}

module.exports.validateLoginForm = function(formData) {
    var errors = {isValid: true, email: "", password: ""};
    validateEmail(formData.email, errors);
    validateLoginPassword(formData.password, errors);
    return errors;
}
module.exports.validateClerkForm = function(formData, filename) {
    var errors = {isValid: true, title: "", description: "", image: "", price: "", amount: 0};
    validateTitle(formData.title, errors);
    validateDescription(formData.description, errors);
    validateImage(filename, errors);
    validatePrice(formData.price, errors);
    validateAmount(formData.amount, errors);
    return errors;
}

function validateFirstName (input, errors) {
    if(!input.trim()) {
        errors.isValid = false;
        errors.firstName += "First name is required";
        return;
    }
    else if (input.length < 2) {
        errors.isValid = false;
        errors.firstName += "The first name must be at least 2 characters long!";
        return;
    }
}

function validateLastName (input, errors) {
    if(!input.trim()) {
        errors.isValid = false;
        errors.lastName += "Last name is required";
        return;
    }
}

function validateEmail (input, errors) {
    if(!input.trim()){
        errors.isValid = false;
        errors.email += "Email field is empty!"
        return;
    }

    else if (!input.includes("@") || !input.includes(".")) {
        errors.isValid = false;
        errors.email += "Please enter a valid email address.";
        return;
    }
}

function validatePassword (input, errors) {
    var regCapitalLetter = /([A-Z]+)/g;
    var regLowerCaseLetter = /([a-z]+)/g;
    var regNumber = /([0-9]+)/g;

    if(!input.trim()){
        errors.isValid = false;
        errors.password += "Password field is empty!";
        return;
    }

    else if (input.length < 6) {
        errors.isValid = false;
        errors.password += "Password must be at least 6 characters long!";
        return;
    }

    else if (!regCapitalLetter.test(input) || !regLowerCaseLetter.test(input) || !regNumber.test(input)) {
        errors.isValid = false;
        errors.password += "Password must contain a LOWERCASE letter, an UPPERCASE letter and a NUMBER.";
        return;
    }
}

function validateLoginPassword(input, errors) {
    if(!input){
        errors.isValid = false;
        errors.password += "Password field is empty!";
        return;
    }
}

function validateTitle(input, errors) {
    if(!input){
        errors.isValid = false;
        errors.title += "The title is empty!";
        return;
    }
}

function validateDescription(input, errors) {
    if(!input){
        errors.isValid = false;
        errors.description += "The description is empty!";
        return;
    }
}

function validatePrice(input, errors) {
    if(!input){
        errors.isValid = false;
        errors.price += "The price field is empty!";
        return;
    }
}

function validateAmount(input, errors) {
    if(!input){
        errors.isValid = false;
        errors.amount += "The amount field is empty!";
        return;
    }
}

function validateImage(input, errors) {
    if(!input){
        errors.isValid = false;
        errors.image += "Please select an image!";
        return;
    }
}
