var express = require('express');
var common = require('./common');
const tables = require('./tables');

function storeEmailCode(user_id, code) {
    
    //store code in database
    tables.getByField('verification_codes', 'user_id', user_id).then(function (res) {
        var verification_code_record = res[0];
        //console.log('verification_code_record', verification_code_record);
        if (verification_code_record) {
            tables.update('verification_codes', verification_code_record.id, 'email_verification_code', code);
        }
        else {
            var verification_code_object = {
                user_id: user_id,
                email_verification_code: code
            }

            tables.addItem('verification_codes', verification_code_object);
        }
    });
    
}

function confirmEmailCode(user_id, code){

    return tables.getByField('verification_codes', 'user_id', user_id).then(function (res) {
        var verification_code_record = res[0];
        //console.log('verification_code_record', verification_code_record);
        if (verification_code_record){
            if (code == verification_code_record.email_verification_code) return true;
            else return false; 
        }
        else return false;
    });

}

function storePhoneCode(user_id, code) {
    
    //store code in database
    tables.getByField('verification_codes', 'user_id', user_id).then(function (res) {
        var verification_code_record = res[0];
        //console.log('verification_code_record', verification_code_record);
        if (verification_code_record) {
            tables.update('verification_codes', verification_code_record.id, 'phone_verification_code', code);
        }
        else {
            var verification_code_object = {
                user_id: user_id,
                phone_verification_code: code
            }

            tables.addItem('verification_codes', verification_code_object);
        }
    });
    
}

function confirmPhoneCode(user_id, code){

    return tables.getByField('verification_codes', 'user_id', user_id).then(function (res) {
        var verification_code_record = res[0];
        //console.log('verification_code_record', verification_code_record);
        if (verification_code_record){
            if (code == verification_code_record.phone_verification_code) return true;
            else return false; 
        }
        else return false;
    });

}

module.exports = {
    storeEmailcode: storeEmailCode,
    confirmEmailCode: confirmEmailCode,
    storePhonecode: storePhoneCode,
    confirmPhoneCode: confirmPhoneCode
};