function Validator(formSelector) {
    var _this = this

    // Tìm thẻ form-group của mỗi input element
    function getParents(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return  element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var validatorRules = {
        required: function(value) {
            return value ? undefined : "Vui lòng nhập trường này!"
        },
        
        email: function(value) {
            var emailRule = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return emailRule.test(value) ? undefined : "Trường này phải là email!"
        },
        
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Mật khẩu phải có tối thiểu ${min} ký tự!`
            }
        },
        
        max: function(max) {
            return function(value) {
                return value.length <= max ? undefined : `Mật khẩu phải có tối đa ${max} ký tự!`
            }
        }
    }
    
    var formElement = document.querySelector(formSelector);
    var formRules = {};
    
    if(formElement) {

        var ruleInfo;
        var inputs = formElement.querySelectorAll('[name][rules]');
        for(var input of inputs) {
            var rules = input.getAttribute('rules').split('|');
            for(var rule of rules) {
                var ruleHasValue = rule.includes(':');
                if(ruleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }

                var ruleFunc = validatorRules[rule];

                if(ruleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }
                
                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }
            
            // Lắng nghe sự kiện 
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }
        
        // Hàm kiểm tra validate, nếu có lỗi thì in ra message
        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;
            
            for (var rule of rules) {
                errorMessage = rule(event.target.value);
                if(errorMessage) {
                    break;
                }
            }

            var formGroup = getParents(event.target, '.form-group');

            if(errorMessage) {
                formGroup.classList.add('invalid');
                if(formGroup) {
                    formGroup.querySelector('.form-message').innerText = errorMessage;
                } 
            }

            return !errorMessage; // Nếu có lỗi thì trả về false, ngược lại
        }

        // Hàm clear message lỗi 
        function handleClearError(event) {
            var formGroup =  getParents(event.target, '.form-group');
            if (formGroup.classList.contains('invalid')) {
                formGroup.querySelector('.form-message').innerText = '';
                formGroup.classList.remove('invalid');
            }
        }
        
    }
    // Lắng nghe sự kiện submit và xử lý
    formElement.onsubmit = function(e) {
            e.preventDefault();

            var inputs = formElement.querySelectorAll('[name][rules]');
            var isValid = true;

            for(var input of inputs) {
                if(!handleValidate({ target: input })) {
                    isValid = false;
                } 
            }
            
            if(isValid) {
                if(typeof _this.onSubmit === 'function')  {
                    var enableInput = formElement.querySelectorAll('[name]');
                    var formValue = Array.from(enableInput).reduce((values, input) => {
                        switch(input.type) {
                            case 'checkbox':
                                if (input.matches(':checked')) {
                                    if (!Array.isArray(values[input.name])) {
                                        values[input.name] = [];
                                    }
                                    values[input.name].push(input.value);
                                } else if (!values[input.name]) {
                                    values[input.name] = '';
                                }
                                break;
                            case 'radio':
                                if(input.matches(':checked')){
                                    values[input.name] = input.value;
                                }
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values; 
                    },{})

                    _this.onSubmit(formValue);
            } else {
                formElement.submit()
            }
        }
    }
}






// Cách 1:

// function validator(options) {

//     function getParents(element, selector) {
//         while(element.parentElement) {
//             if(element.parentElement.matches(selector)) {
//                 return element.parentElement;
//             }
//             element = element.parentElement;
//         }
//     }

//     // Hàm validate
//     function Validate(inputElement, rule) {
//         var errorMesage;
//         var inputParents = getParents(inputElement, options.formParent).querySelector(options.errorSelector);
//         var rules = selectorRules[rule.selector];

//         for(var i = 0; i < rules.length; i++) {
//             switch(inputElement.type) {
//                 case 'checkbox':
//                 case 'radio':
//                     errorMesage = rules[i](
//                         formElement.querySelector(rule.selector + ':checked')
//                     );
//                     break;
//                 default:
//                     errorMesage = rules[i](inputElement.value);
//             }
//             if(errorMesage) break;
//         }

//         if(errorMesage) {
//             inputParents.innerText = errorMesage;
//             getParents(inputElement, options.formParent).classList.add('invalid');
//         } else {
//             inputParents.innerText = "";
//             getParents(inputElement, options.formParent).classList.remove('invalid');
//         }  
        
//         return !errorMesage; // Nếu valid có lỗi thì trả về false, ngược lại
//     }

//     var selectorRules = {};

//     // Lấy element của form cần validate
//     var formElement = document.querySelector(options.form);

//     // Xử lý chặn hành vi mặc định của form khi submit
//     formElement.onsubmit = function(e) {
//         e.preventDefault();

//         var isFormValid = true;

//         options.rules.forEach((rule) =>{
//             var inputElement = formElement.querySelector(rule.selector);
//             var isValid = Validate(inputElement, rule);
//             if(!isValid) {
//                 isFormValid = false;
//             }
//         })

//         if(isFormValid) {
//             // Xử lý submit bằng js
//             if(typeof options.onSubmit === 'function')  {
//                 var enableInput = formElement.querySelectorAll('[name]');
//                 var formValue = Array.from(enableInput).reduce((values, input) => {
//                     switch(input.type) {
//                         case 'checkbox':
//                             if (input.matches(':checked')) {
//                                 if (!Array.isArray(values[input.name])) {
//                                     values[input.name] = [];
//                                 }
//                                 values[input.name].push(input.value);
//                             } else if (!values[input.name]) {
//                                 values[input.name] = '';
//                             }
//                             break;
//                         case 'radio':
//                             if(input.matches(':checked')){
//                                 values[input.name] = input.value;
//                             }
//                             break;
//                         case 'file':
//                             values[input.name] = input.files;
//                             break;
//                         default:
//                             values[input.name] = input.value;
//                     }
//                     return values; 
//                 },{})

//                 options.onSubmit(formValue);
//             } 
//             // submit theo mặc định
//             else {
//                 formElement.submit();
//             }
//         } 
//     }
    
//     if(formElement) {
//         options.rules.forEach((rule) => {

//             // Lấy tất cả rules của mỗi selector
//             if(Array.isArray(selectorRules[rule.selector])) {
//                 selectorRules[rule.selector].push(rule.test);
//             } else {
//                 selectorRules[rule.selector] = [rule.test];
//             }

//             var inputElements = formElement.querySelectorAll(rule.selector);
//             Array.from(inputElements).forEach((inputElement) => {
//                 // Xử lý khi blur ra khỏi input
//                 inputElement.onblur = function() {
//                     Validate(inputElement, rule)
//                 }

//                 // Xử lý mỗi khi nhập input
//                 inputElement.oninput = function() {
//                     var inputParents = getParents(inputElement, options.formParent).querySelector(options.errorSelector);
//                     inputParents.innerText = "";
//                     getParents(inputElement, options.formParent).classList.remove('invalid');
//                 }
//             })
//         })
//     }
// }

// validator.isRequired = function (selector, message) {
//     return {
//         selector: selector,
//         test: function(value) {
//             return value ? undefined : message || "Vui lòng nhập trường này"
//         }
//     }
// }

// validator.isEmail = function (selector) {
//     return {
//         selector: selector,
//         test: function(value) {
//             var emailRule = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//             return emailRule.test(value) ? undefined : 'Trường này phải là email!'
//         }
//     }
// }

// validator.minLength = function (selector, min) {
//     return {
//         selector: selector,
//         test: function(value) {
//             return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự!`
//         }
//     }
// }

// validator.isConfirmed = function (selector, getConfirmValue, message) {
//     return {
//         selector: selector,
//         test: function(value) {
//             return value === getConfirmValue() ? undefined : message ||'Vui lòng nhập lại';
//         }
//     }
// }
