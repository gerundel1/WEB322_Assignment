var mealPackages = [
    {
        title:"Maple-Mustard Pork Chops",
        image:"/top_packages/first_top_meal.jpg",
        price:"$6.45",
        rated: true,
        isAMeal: true
    },
    {
        title:"Cheesy Stuffed Meatballs",
        image:"/top_packages/second_top_meal.jpg",
        price:"$7.25",
        rated: true,
        isAMeal: true
    },
    {
        title:"Roasted Shawarma Chicken and Squash Freekeh",
        image:"/top_packages/third_top_meal.jpg",
        price:"$8.10",
        rated: true,
        isAMeal: true
    },
    {
        title:"Broccoli Stir Fry",
        image:"/top_packages/fourth_top_meal.jpg",
        price:"$9.50",
        rated: true,
        isAMeal: true
    },
    {
        title:"Muscle Gain Package",
        image:"/meal_packages/muscle.jpg",
        price:"$9.49/meal",
        amount: 11,
        rated: false,
        isAMeal: true
    },
    {
        title:"Gluten-free Package",
        image:"/meal_packages/gluten-free.jpg",
        price:"$117.00",
        amount: 12,
        rated: false,
        isAMeal: true
    },
    {
        title:"Keto Package",
        image:"/meal_packages/keto.jpg",
        price:"9.29/meal",
        amount: 21,
        rated: false,
        isAMeal: true
    },
    {
        title:"Prebiotic Soup Cleanse",
        image:"/meal_packages/muscle.jpg",
        price:"$129.00",
        amount: 14,
        rated: false,
        isAMeal: true
    },
    {
        title: "Choose your meals",
        image: "choose.jpg",
        alt: "Card image cap",
        isAMeal: false
    },
    {
        title: "Create the perfect box",
        image: "create.jpg",
        alt: "Card image cap",
        isAMeal: false
    },
    {
        title: "Get convenient weekly deliveries",
        image: "get-delivered.jpg",
        alt: "Card image cap",
        isAMeal: false
    },
    {
        title: "Cook seasonal, fresh ingredients",
        image: "cook.jpg",
        alt: "Card image cap",
        isAMeal: false
    }
];

module.exports.getMealPackages = function() {
    return mealPackages;
}


module.exports.getUnratedPackages = function () {
    let temp = [];
    mealPackages.forEach (function(package) {
        if (!package.rated & package.isAMeal) {
            temp.push(package);
        }
    });
    return temp;
}

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