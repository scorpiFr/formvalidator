"use strict";

/**
 * Form check engine.
 *
 * Ex Code1 : on a button
 * var formdata = site.forms.getFormValues('createClaim');
 * if (formdata == false || Object.keys(formdata['errors']).length > 0)
 * return (false);
 * $.post(url, params['values'], "json");
 *
 * Ex Code2 : on a onsubmit 
 * <form action="/toto" method="POST" onsubmit="return(site.forms.validateForm('createConstructorForm'));" >
 */
site.forms = {
	init: function () {
		
	},

	/**
	 * Verify a form et return sanitized values.
	 * @param	string	formName	Configuration name. Ex : createrepairerform  (for site.forms.createrepairerform).
	 * @return	object	{values:{"field":"sanitizedValue", "field2":"sanitizedValue2",... }, errors:{"field":"ERROR", "field2":"ERROR", ...}}
	 */
	getFormValues: function (formName) {
		// verifications
		if (typeof site.forms[formName] == 'undefined') {
			return (false);
		}
		var res = {values:{}, errors:{}};
		for (var i in site.forms[formName]) {
			var val = this.validateField(site.forms[formName][i]);
			if (val == 'ERROR') {
				res['errors'][i] = 'ERROR';
			} else {
				res['values'][i] = val;
			}
		}
		
		// return
		return (res);
	},
	
	/**
	 * Verify if a form is valid.
	 * @param	string	formName	Configuration name. Ex : createrepairerform  (for site.forms.createrepairerform).
	 * @return	boolean	true if form is valid.
	 */
	validateForm: function (formName) {
		// verifications
		if (typeof site.forms[formName] == 'undefined') {
			return (false);
		}
		// get values
		var ret = this.getFormValues(formName);
		if (ret == false)
			return (false);
		// return
		if (Object.keys(ret['errors']).length > 0)
			return (false);
		return (true);
	},

	/**
	 * Private function.
	 * Verify one field.
	 * @param	array	fieldData	Field configuration parameters. Ex : {fieldId: 'MAX_DISTANCE_METER',type: 'integer',required: 'true',min: 1,max: 99999,redlightOnError: 'true',}
	 * @return	string	Sanitized value. 'ERROR' if field doesn't match controls.	
	 */
	validateField: function (fieldData) {
		// verification
		if (typeof fieldData == 'undefined') {
			return ('ERROR');
		}

		/* 
			form types : 
			
			string
			integer
			password
			email
			select
			select2multiple
			phone_international
		*/
		
		// get values
		var myval = '';
		if (fieldData.type == 'string') {
			myval = this.validateField_string(fieldData);
		} else if (fieldData.type == 'integer') {
			myval = this.validateField_integer(fieldData);
		} else if (fieldData.type == 'password') {
			myval = this.validateField_password(fieldData);
		} else if (fieldData.type == 'email') {
			myval = this.validateField_email(fieldData);
		} else if (fieldData.type == 'select') {
			myval = this.validateField_select(fieldData);
		} else if (fieldData.type == 'select2multiple') {
			myval = this.validateField_select2multiple(fieldData);
		} else if (fieldData.type == 'phone_international') {
			myval = this.validateField_phoneinternational(fieldData);
		} else if (fieldData.type == 'date_EN') {
			myval = this.validateField_date_en(fieldData);
		} else {
			myval = 'ERROR';
		}
		
		// return
		return (myval);
	},

	/**
	 * Private function.
	 * Verify one string field.
	 * @param	array	fieldData	Field configuration parameters. Ex : {fieldId: 'MAX_DISTANCE_METER',type: 'integer',required: 'true',min: 1,max: 99999,redlightOnError: 'true',}
	 * @return	string	Sanitized value. 'ERROR' if field doesn't match controls.	
	 */
	validateField_string: function (fieldData) {
		// initialisation
		{
			// hide error div
			if (typeof fieldData.errorId != 'undefined') {
				$('#'+fieldData.errorId).hide();
			}
			// border
			
			if (typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
				$('#'+fieldData.fieldId).css('border', '1px solid lightgrey').css('border-radius', '4px');
			}
			
		}
		// get value
		{
			var fieldValue = '';
			if (typeof fieldData.value != 'undefined')
			{
				// get from static value
				fieldValue = fieldData.value;
			} else if (typeof fieldData.fieldId != 'undefined') {
				// get from form
				if ($('#'+fieldData.fieldId).length <= 0) {
					fieldValue = 'ERROR';
				}
				fieldValue = $('#'+fieldData.fieldId).val();
			} else {
				fieldValue = 'ERROR';
			}
			fieldValue = fieldValue.trim();
		}

		// required
		if (fieldValue != 'ERROR' && fieldData.required != 'undefined' && fieldData.required == 'true') {
			if (fieldValue.length <= 0) {
				fieldValue = 'ERROR';
			}
		}

		// minlength
		if (fieldValue.length > 0 && fieldValue != 'ERROR' && typeof fieldData.minlength != 'undefined') {
			if (fieldData.minlength > fieldValue.length) {
				fieldValue = 'ERROR';
			}
		}
		
		// maxlength
		if (fieldValue != 'ERROR' && typeof fieldData.maxlength != 'undefined') {
			if (fieldData.maxlength < fieldValue.length) {
				fieldValue = 'ERROR';
			}
		}

		// errorId
		if (fieldValue == 'ERROR' && typeof fieldData.errorId != 'undefined') {
			$('#'+fieldData.errorId).show();
		}
		
		// redlightOnError
		if (fieldValue == 'ERROR' && typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
			$('#'+fieldData.fieldId).css('border', '2px solid red').css('border-radius', '4px');
		}
		return (fieldValue);
	},
	
	/**
	 * Private function.
	 * Verify one password field.
	 * @param	array	fieldData	Field configuration parameters. Ex : {fieldId: 'MAX_DISTANCE_METER',type: 'integer',required: 'true',min: 1,max: 99999,redlightOnError: 'true',}
	 * @return	string	Sanitized value. 'ERROR' if field doesn't match controls.
	 *
	 * @note A valid password must contains one lowercase letter, one uppercase letter and one digit
	 */
	validateField_password: function (fieldData) {
		// initialisation
		{
			// hide error div
			if (typeof fieldData.errorId != 'undefined') {
				$('#'+fieldData.errorId).hide();
			}
			// border
			if (typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
				$('#'+fieldData.fieldId).css('border', '1px solid lightgrey').css('border-radius', '4px');
			}
			
		}
		// get value
		{
			var fieldValue = '';
			if (typeof fieldData.value != 'undefined')
			{
				// get from static value
				fieldValue = fieldData.value;
			} else if (typeof fieldData.fieldId != 'undefined') {
				// get from form
				if ($('#'+fieldData.fieldId).length <= 0) {
					fieldValue = 'ERROR';
				}
				fieldValue = $('#'+fieldData.fieldId).val();
			} else {
				fieldValue = 'ERROR';
			}
			fieldValue = fieldValue.trim();
		}

		// required
		if (fieldValue != 'ERROR' && typeof fieldData.required != 'undefined' && fieldData.required == 'true') {
			if (fieldValue.length <= 0) {
				fieldValue = 'ERROR';
			}
		}

		// minlength
		if (fieldValue.length > 0 && fieldValue != 'ERROR' && typeof fieldData.minlength != 'undefined') {
			if (fieldData.minlength > fieldValue.length) {
				fieldValue = 'ERROR';
			}
		}
		
		// maxlength
		if (fieldValue != 'ERROR' && typeof fieldData.maxlength != 'undefined') {
			if (fieldData.maxlength < fieldValue.length) {
				fieldValue = 'ERROR';
			}
		}
		// lowercase, uppercase, number
		if (fieldValue != 'ERROR')
		{
			var lowercaseFlag = 0;
			var uppercaseFlag = 0;
			var numberFlag = 0;

			for (var i = fieldValue.length; i >= 0; i--) {
				var ascii = fieldValue.charCodeAt(i);
				// lowercase
				if (lowercaseFlag == 0 && ascii >= 97 && ascii <= 122) {
					lowercaseFlag = 1;
				}
				// uppercase
				else if (uppercaseFlag == 0 && ascii >= 65 && ascii <= 90) {
					uppercaseFlag = 1;
				}
				// number
				else if (numberFlag == 0 && ascii >= 48 && ascii <= 57) {
					numberFlag = 1;
				}
				else {
					continue;
				}
				if (lowercaseFlag == 1 && uppercaseFlag == 1 && numberFlag == 1) {
					break;
				}
			}

			if (lowercaseFlag == 0 || uppercaseFlag == 0 || numberFlag == 0) {
				fieldValue = 'ERROR';
			}
		}
		// errorId
		if (fieldValue == 'ERROR' && typeof fieldData.errorId != 'undefined') {
			$('#'+fieldData.errorId).show();
		}
		
		// redlightOnError
		if (fieldValue == 'ERROR' && typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
			$('#'+fieldData.fieldId).css('border', '2px solid red').css('border-radius', '4px');
		}
		return (fieldValue);
	},

	/**
	 * Private function.
	 * Verify one email field.
	 *
	 * @param	array	fieldData	Field configuration parameters. Ex : {fieldId: 'MAX_DISTANCE_METER',type: 'integer',required: 'true',min: 1,max: 99999,redlightOnError: 'true',}
	 *
	 * @return	string	Sanitized value. 'ERROR' if field doesn't match controls.
	 *
	 */
	validateField_email: function (fieldData) {
		// initialisation
		{
			// hide error div
			if (typeof fieldData.errorId != 'undefined') {
				$('#'+fieldData.errorId).hide();
			}
			// border
			if (typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
				$('#'+fieldData.fieldId).css('border', '1px solid lightgrey').css('border-radius', '4px');
			}
			
		}
		// get value
		{
			var fieldValue = '';
			if (typeof fieldData.value != 'undefined')
			{
				// get from static value
				fieldValue = fieldData.value;
			} else if (typeof fieldData.fieldId != 'undefined') {
				// get from form
				if ($('#'+fieldData.fieldId).length <= 0) {
					fieldValue = 'ERROR';
				}
				fieldValue = $('#'+fieldData.fieldId).val();
			} else {
				fieldValue = 'ERROR';
			}
			fieldValue = fieldValue.trim();
		}
		// required
		if (fieldValue != 'ERROR' && typeof fieldData.required != 'undefined' && fieldData.required == 'true') {
			if (fieldValue.length <= 0) {
				fieldValue = 'ERROR';
			}
		}

		// minlength
		if (fieldValue != 'ERROR' && fieldValue.length > 0 && typeof fieldData.minlength != 'undefined') {
			if (fieldData.minlength > fieldValue.length) {
				fieldValue = 'ERROR';
			}
		}
		
		// maxlength
		if (fieldValue != 'ERROR' && fieldValue.length > 0 && typeof fieldData.maxlength != 'undefined') {
			if (fieldData.maxlength < fieldValue.length) {
				fieldValue = 'ERROR';
			}
		}
		
		// regex
		if (fieldValue != 'ERROR' && fieldValue.length > 0) {
			if (!/^([a-zA-Z0-9_\-\.]+)\+?([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/.test(fieldValue)) {
				fieldValue = 'ERROR';
			}
		}

		// errorId
		if (fieldValue == 'ERROR' && typeof fieldData.errorId != 'undefined') {
			$('#'+fieldData.errorId).show();
		}

		// redlightOnError
		if (fieldValue == 'ERROR' && typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
			$('#'+fieldData.fieldId).css('border', '2px solid red').css('border-radius', '4px');
		}

		return (fieldValue);
	},

	/**
	 * Private function.
	 * Verify one "select multiple" field in a select2.
	 * @param	array	fieldData	Field configuration parameters. Ex : {fieldId: 'MAX_DISTANCE_METER',type: 'integer',required: 'true',min: 1,max: 99999,redlightOnError: 'true',}
	 * @return	string	Sanitized value. 'ERROR' if field doesn't match controls.
	 */
	validateField_select2multiple: function (fieldData) {
		// initialisation
		{
			// hide error div
			if (typeof fieldData.errorId != 'undefined') {
				$('#'+fieldData.errorId).hide();
			}
			// border
			if (typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
				$('#'+fieldData.fieldId+' ~ span.select2-container').css('border', '1px solid lightgrey').css('border-radius', '4px');
			}
			
		}
		// get value
		{
			var fieldValue = '';
			if (typeof fieldData.value != 'undefined')
			{
				// get from static value
				fieldValue = fieldData.value;
			} else if (typeof fieldData.fieldId != 'undefined') {
				// get from form
				if ($('#'+fieldData.fieldId).length <= 0) {
					fieldValue = 'ERROR';
				}
				fieldValue = $('#'+fieldData.fieldId).val();
			} else {
				fieldValue = 'ERROR';
			}
		}

		// required
		if (fieldValue != 'ERROR' && typeof fieldData.required != 'undefined' && fieldData.required == 'true') {
			if (fieldValue.length <= 0) {
				fieldValue = 'ERROR';
			}
		}

		// errorId
		if (fieldValue == 'ERROR' && typeof fieldData.errorId != 'undefined') {
			$('#'+fieldData.errorId).show();
		}
		
		// redlightOnError
		if (fieldValue == 'ERROR' && typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
			$('#'+fieldData.fieldId+' ~ span.select2-container').css('border', '2px solid red').css('border-radius', '4px');
		}
		return (fieldValue);
	},

	/**
	 * Private function.
	 * Verify one "select" field.
	 * @param	array	fieldData	Field configuration parameters. Ex : {fieldId: 'MAX_DISTANCE_METER',type: 'integer',required: 'true',min: 1,max: 99999,redlightOnError: 'true',}
	 * @return	string	Sanitized value. 'ERROR' if field doesn't match controls.
	 */
	validateField_select: function (fieldData) {
		// initialisation
		{
			// hide error div
			if (typeof fieldData.errorId != 'undefined') {
				$('#'+fieldData.errorId).hide();
			}
			// border
			if (typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
				$('#'+fieldData.fieldId).css('border', '1px solid lightgrey').css('border-radius', '4px');
			}
			
		}
		// get value
		{
			var fieldValue = '';
			if (typeof fieldData.value != 'undefined')
			{
				// get from static value
				fieldValue = fieldData.value;
			} else if (typeof fieldData.fieldId != 'undefined') {
				// get from form
				if ($('#'+fieldData.fieldId).length <= 0) {
					fieldValue = 'ERROR';
				}
				fieldValue = $('#'+fieldData.fieldId).val();
			} else {
				fieldValue = 'ERROR';
			}
			fieldValue = fieldValue.trim();
		}

		// required
		if (fieldValue != 'ERROR' && typeof fieldData.required != 'undefined' && fieldData.required == 'true') {
			if (fieldValue.length <= 0 || fieldValue == '0') {
				fieldValue = 'ERROR';
			}
		}

		// errorId
		if (fieldValue == 'ERROR' && typeof fieldData.errorId != 'undefined') {
			$('#'+fieldData.errorId).show();
		}
		
		// redlightOnError
		if (fieldValue == 'ERROR' && typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
			$('#'+fieldData.fieldId).css('border', '2px solid red').css('border-radius', '4px');
		}
		return (fieldValue);
	},

	/**
	 * Private function.
	 * Verify one international phone field.
	 * @param	array	fieldData	Field configuration parameters. Ex : {fieldId: 'MAX_DISTANCE_METER',type: 'integer',required: 'true',min: 1,max: 99999,redlightOnError: 'true',}
	 * @return	string	Sanitized value. 'ERROR' if field doesn't match controls.
	 */
	validateField_phoneinternational: function (fieldData) {
		// initialisation
		{
			// hide error div
			if (typeof fieldData.errorId != 'undefined') {
				$('#'+fieldData.errorId).hide();
			}
			// border
			if (typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
				$('#'+fieldData.fieldId).css('border', '1px solid lightgrey').css('border-radius', '4px');
			}
			
		}
		// get value
		{
			var fieldValue = '';
			if (typeof fieldData.value != 'undefined')
			{
				// get from static value
				fieldValue = fieldData.value;
			} else if (typeof fieldData.fieldId != 'undefined') {
				// get from form
				if ($('#'+fieldData.fieldId).length <= 0) {
					fieldValue = 'ERROR';
				}
				fieldValue = $('#'+fieldData.fieldId).val();
			} else {
				fieldValue = 'ERROR';
			}
			fieldValue = fieldValue.trim();
		}

		// required
		if (fieldValue != 'ERROR' && typeof fieldData.required != 'undefined' && fieldData.required == 'true') {
			if (fieldValue.length <= 0 || fieldValue == '0') {
				fieldValue = 'ERROR';
			}
		}

		// regex
		if (fieldValue != 'ERROR' && fieldValue.length > 0) {
			if (!/^(\+{0,1})([0-9])+$/.test(fieldValue)) {
				fieldValue = 'ERROR';
			}
		}

		// errorId
		if (fieldValue == 'ERROR' && typeof fieldData.errorId != 'undefined') {
			$('#'+fieldData.errorId).show();
		}
		
		// redlightOnError
		if (fieldValue == 'ERROR' && typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
			$('#'+fieldData.fieldId).css('border', '2px solid red').css('border-radius', '4px');
		}
		return (fieldValue);
	},

	/**
	 * Private function.
	 * Verify one integer field.
	 *
	 * @param	array	fieldData	Field configuration parameters. Ex : {fieldId: 'MAX_DISTANCE_METER',type: 'integer',required: 'true',min: 1,max: 99999,redlightOnError: 'true',}
	 * @return	string	Sanitized value. 'ERROR' if field doesn't match controls.
	 */
	validateField_integer: function (fieldData) {
		// initialisation
		{
			// hide error div
			if (typeof fieldData.errorId != 'undefined') {
				$('#'+fieldData.errorId).hide();
			}
			// border
			if (typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
				$('#'+fieldData.fieldId).css('border', '1px solid lightgrey').css('border-radius', '4px');
			}
			
		}
		// get value
		{
			var fieldValue = '';
			if (typeof fieldData.value != 'undefined')
			{
				// get from static value
				fieldValue = fieldData.value;
			} else if (typeof fieldData.fieldId != 'undefined') {
				// get from form
				if ($('#'+fieldData.fieldId).length <= 0) {
					fieldValue = 'ERROR';
				}
				fieldValue = $('#'+fieldData.fieldId).val();
			} else {
				fieldValue = 'ERROR';
			}
			fieldValue = fieldValue.trim();
		}
		// required
		if (fieldValue != 'ERROR' && typeof fieldData.required != 'undefined' && fieldData.required == 'true') {
			if (fieldValue.length <= 0 || fieldValue == '0') {
				fieldValue = 'ERROR';
			}
		}

		// regex
		if (fieldValue.length > 0 && fieldValue != 'ERROR') {
			if (!/^[0-9]+$/.test(fieldValue)) {
				fieldValue = 'ERROR';
			}
		}

		// min
		if (fieldValue.length > 0 && fieldValue != 'ERROR' && typeof fieldData.min != 'undefined') {
			if (fieldData.min > fieldValue) {
				fieldValue = 'ERROR';
			}
		}

		// max
		if (fieldValue.length > 0 && fieldValue != 'ERROR' && typeof fieldData.max != 'undefined') {
			if (fieldData.max < fieldValue) {
				fieldValue = 'ERROR';
			}
		}

		// errorId
		if (fieldValue == 'ERROR' && typeof fieldData.errorId != 'undefined') {
			$('#'+fieldData.errorId).show();
		}

		// redlightOnError
		if (fieldValue == 'ERROR' && typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
			$('#'+fieldData.fieldId).css('border', '2px solid red').css('border-radius', '4px');
		}
		
		return (fieldValue);
	},

	/**
	 * Private function.
	 * Verify one date field.
	 * @param	array	fieldData	Field configuration parameters. Ex : {fieldId: 'MAX_DISTANCE_METER',type: 'integer',required: 'true',min: 1,max: 99999,redlightOnError: 'true',}
	 * @return	string	Sanitized value. 'ERROR' if field doesn't match controls.
	 *
	 */
	validateField_date_en: function (fieldData) {
		// initialisation
		{
			// hide error div
			if (typeof fieldData.errorId != 'undefined') {
				$('#'+fieldData.errorId).hide();
			}
			// border
			if (typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
				$('#'+fieldData.fieldId).css('border', '1px solid lightgrey').css('border-radius', '4px');
			}
			
		}
		// get value
		{
			var fieldValue = '';
			if (typeof fieldData.value != 'undefined')
			{
				// get from static value
				fieldValue = fieldData.value;
			} else if (typeof fieldData.fieldId != 'undefined') {
				// get from form
				if ($('#'+fieldData.fieldId).length <= 0) {
					fieldValue = 'ERROR';
				}
				fieldValue = $('#'+fieldData.fieldId).val();
			} else {
				fieldValue = 'ERROR';
			}
			fieldValue = fieldValue.trim();
		}

		// required
		if (fieldValue != 'ERROR' && typeof fieldData.required != 'undefined' && fieldData.required == 'true') {
			if (fieldValue.length <= 0) {
				fieldValue = 'ERROR';
			}
		}

		// regex
		if (fieldValue != 'ERROR' && fieldValue.length > 0) {
			if (!/^([0-9]{4})(\-{1})([0-9]{2})(\-{1})([0-9]{2})$/.test(fieldValue)) {
				fieldValue = 'ERROR';
			}
		}

		// errorId
		if (fieldValue == 'ERROR' && typeof fieldData.errorId != 'undefined') {
			$('#'+fieldData.errorId).show();
		}
		
		// redlightOnError
		if (fieldValue == 'ERROR' && typeof fieldData.fieldId != 'undefined' && typeof fieldData.redlightOnError != 'undefined' && fieldData.redlightOnError == 'true') {
			$('#'+fieldData.fieldId).css('border', '2px solid red').css('border-radius', '4px');
		}
		return (fieldValue);
	},
	
};

/**
 * "createrepairer" form configuration.
 */
site.forms.createrepairerform = {
	LOGIN: {
		fieldId: 'LOGIN',
		type: 'string',
		required: 'true',
		minlength: 5,
		maxlength: 255,
		redlightOnError: 'true',
		errorId: 'LOGIN_error',
		// value='toto',
	},
	PWD : {
		fieldId: 'PWD',
		type: 'password',
		required: 'true',
		minlength: 6,
		maxlength: 255,
		redlightOnError: 'true',
		errorId: 'PWD_error',
		// 6 caractères minimum est requis comprenant une lettre, un chiffre et une majuscule
	},
	CONTACTEMAIL : {
		fieldId: 'CONTACTEMAIL',
		type: 'email',
		required: 'true',
		minlength: 1,
		maxlength: 255,
		redlightOnError: 'true',
		errorId: 'EMAIL_error',
	},
	CONTACTLASTNAME : {
		fieldId: 'CONTACTLASTNAME',
		type: 'string',
		required: 'true',
		minlength: 1,
		maxlength: 255,
		redlightOnError: 'true',
		errorId: 'CONTACTLASTNAME_error',
	},
	CONTACTNAME : {
		fieldId: 'CONTACTNAME',
		type: 'string',
		required: 'true',
		minlength: 1,
		maxlength: 255,
		redlightOnError: 'true',
		errorId: 'CONTACTNAME_error',
	},
	PRODUCTWORLDID : {
		fieldId: 'PRODUCTWORLDID',
		type: 'select2multiple',
		required: 'true',
		redlightOnError: 'true',
		errorId: 'PRODUCTWORLDID_error',
	},
	COUNTRY : {
		fieldId: 'COUNTRY',
		type: 'select',
		required: 'true',
		redlightOnError: 'true',
	},
	PHONE : {
		fieldId: 'PHONE',
		type: 'phone_international',
		required: 'true',
		redlightOnError: 'true',
		errorId: 'PHONE_error',
	},
	PHONE_PREFIX : {
		fieldId: 'COUNTRY',
		type: 'select',
		required: 'true',
		redlightOnError: 'true',
	},
	ADDR_NAME : {
		fieldId: 'ADDR_NAME',
		type: 'string',
		required: 'true',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
		errorId: 'ADDR_NAME_error',
	},
	ADDR_NAME2 : {
		fieldId: 'ADDR_NAME2',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_NUM : {
		fieldId: 'ADDR_NUM',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_STREET : {
		fieldId: 'ADDR_STREET',
		type: 'string',
		required: 'true',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
		errorId: 'ADDR_STREET_error',
	},
	ADDR_STREET2 : {
		fieldId: 'ADDR_STREET2',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_ZIPCODE : {
		fieldId: 'ADDR_ZIPCODE',
		type: 'string',
		required: 'true',
		minlength: 1,
		maxlength: 6,
		redlightOnError: 'true',
		errorId: 'ADDR_ZIPCODE_error',
	},
	ADDR_CITY : {
		fieldId: 'ADDR_CITY',
		type: 'string',
		required: 'true',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
		errorId: 'ADDR_CITY_error',
	},
	MAX_DISTANCE_METER : {
		fieldId: 'MAX_DISTANCE_METER',
		type: 'integer',
		required: 'true',
		min: 1,
		max: 99999,
		redlightOnError: 'true',
	},	
	MAX_DRIVE_TIME_SECONDS : {
		fieldId: 'MAX_DRIVE_TIME_SECONDS',
		type: 'integer',
		required: 'true',
		min: 1,
		max: 3600,
		redlightOnError: 'true',
	},
};


/**
 * "create constructor" form configuration.
 */
site.forms.createConstructorForm = {
	LOGIN: {
		fieldId: 'LOGIN',
		type: 'string',
		required: 'true',
		minlength: 5,
		maxlength: 255,
		redlightOnError: 'true',
		errorId: 'LOGIN_error',
		// value='toto',
	},
	PWD : {
		fieldId: 'PWD',
		type: 'password',
		required: 'true',
		minlength: 6,
		maxlength: 255,
		redlightOnError: 'true',
		errorId: 'PWD_error',
		// 6 caractères minimum est requis comprenant une lettre, un chiffre et une majuscule
	},
	CONTACTEMAIL : {
		fieldId: 'CONTACTEMAIL',
		type: 'email',
		required: 'true',
		minlength: 1,
		maxlength: 255,
		redlightOnError: 'true',
		errorId: 'EMAIL_error',
	},
	CONTACTNAME : {
		fieldId: 'CONTACTNAME',
		type: 'string',
		required: 'true',
		minlength: 2,
		maxlength: 255,
		redlightOnError: 'true',
		errorId: 'CONTACTNAME_error',
	}, 
	PRODUCTWORLDID : {
		fieldId: 'PRODUCTWORLDID',
		type: 'select2multiple',
		required: 'true',
		redlightOnError: 'true',
		errorId: 'PRODUCTWORLDID_error',
	},
	COUNTRY : {
		fieldId: 'COUNTRY',
		type: 'select',
		required: 'true',
		redlightOnError: 'true',
	},
	PHONE : {
		fieldId: 'PHONE',
		type: 'phone_international',
		required: 'false',
		redlightOnError: 'true',
	},
	PHONE_PREFIX : {
		fieldId: 'COUNTRY',
		type: 'select',
		required: 'false',
	},
	ADDR_NAME : {
		fieldId: 'ADDR_NAME',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_NAME2 : {
		fieldId: 'ADDR_NAME2',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_NUM : {
		fieldId: 'ADDR_NUM',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_STREET : {
		fieldId: 'ADDR_STREET',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_STREET2 : {
		fieldId: 'ADDR_STREET2',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_ZIPCODE : {
		fieldId: 'ADDR_ZIPCODE',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 6,
		redlightOnError: 'true',
	},
	ADDR_CITY : {
		fieldId: 'ADDR_CITY',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
};

/**
 * "claimpresim" form configuration.
 */
site.forms.claimPresimForm = {
	COUNTRY : {
		fieldId: 'COUNTRY',
		type: 'select',
		required: 'true',
		redlightOnError: 'true',
	},
	CUSTOMER_ADDR_ZIPCODE : {
		fieldId: 'CUSTOMER_ADDR_ZIPCODE',
		type: 'string',
		required: 'true',
		minlength: 1,
		maxlength: 255,
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custAddrzip',
	},
	PRODUCTWORLD_ID : {
		fieldId: 'PRODUCTWORLD_ID',
		type: 'select',
		required: 'true',
		redlightOnError: 'true',
	},
	SKILLS_ID : {
		fieldId: 'SKILLS_ID',
		type: 'select2multiple',
		required: 'false',
		redlightOnError: 'true',
	},	
};

/**
 * "create claim" form configuration.
 */
site.forms.createClaim = {
	TITLE : {
		fieldId: 'TITLE',
		type: 'string',
		required: 'true',
		minlength: 1,
		maxlength: 254,
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_title',
	},
	PRICE : {
		fieldId: 'PRICE',
		type: 'integer',
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_price',
	},
	PRODUCT_ERRORCODE : {
		fieldId: 'PRODUCT_ERRORCODE',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	CONSTRUCTOR_FILE_ID : {
		fieldId: 'CONSTRUCTOR_FILE_ID',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	DESCRIPTION : {
		fieldId: 'DESCRIPTION',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},	
	WARRANTY_DESCRIPTION : {
		fieldId: 'WARRANTY_DESCRIPTION',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	MAXDATEWAITINGREPAIR : {
		fieldId: 'MAXDATEWAITINGREPAIR',
		type: 'date_EN',
		required: 'false',
		redlightOnError: 'true',
	},
	PRODUCT_MANUFACTURER : {
		fieldId: 'PRODUCT_MANUFACTURER',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_constr',
	},
	PRODUCTWORLD_ID : {
		fieldId: 'PRODUCTWORLD_ID',
		type: 'select',
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_PW',
	},
	PRODUCT_MODELNAME : {
		fieldId: 'PRODUCT_MODELNAME',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_model',
	},
	IDENTNUMBER : {
		fieldId: 'IDENTNUMBER',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	SERIALNO : {
		fieldId: 'SERIALNO',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	PRODUCT_DATEOFBUY : {
		fieldId: 'PRODUCT_DATEOFBUY',
		type: 'date_EN',
		required: 'false',
		redlightOnError: 'true',
	},
	CUSTOMER_LASTNAME : {
		fieldId: 'CUSTOMER_LASTNAME',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custLastname',
	},
	CUSTOMER_NAME : {
		fieldId: 'CUSTOMER_NAME',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custFirstname',
	},
	CUSTOMER_PHONE : {
		fieldId: 'CUSTOMER_PHONE',
		type: 'phone_international',
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custPhone',
	},
	CUSTOMER_EMAIL : {
		fieldId: 'CUSTOMER_EMAIL',
		type: 'email',
		required: 'false',
		redlightOnError: 'true',
	},
	CUSTOMER_ADDR_NAME : {
		fieldId: 'CUSTOMER_ADDR_NAME',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custAddrname',
	},
	CUSTOMER_ADDR_NAME2 : {
		fieldId: 'CUSTOMER_ADDR_NAME2',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	CUSTOMER_ADDR_NUM : {
		fieldId: 'CUSTOMER_ADDR_NUM',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	CUSTOMER_ADDR_STREET : {
		fieldId: 'CUSTOMER_ADDR_STREET',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custAddrstreet',
	},
	CUSTOMER_ADDR_STREET2 : {
		fieldId: 'CUSTOMER_ADDR_STREET2',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	CUSTOMER_ADDR_ZIPCODE : {
		fieldId: 'CUSTOMER_ADDR_ZIPCODE',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custAddrzip',
	},
	CUSTOMER_ADDR_CITY : {
		fieldId: 'CUSTOMER_ADDR_CITY',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custAddrcity',
	},
	COUNTRY : {
		fieldId: 'COUNTRY',
		type: 'select',
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custAddrcountry',
	},
};

/**
 * "update Claim Draft" form configuration.
 */
site.forms.updateClaimDraft = {
	TITLE : {
		fieldId: 'TITLE',
		type: 'string',
		required: 'true',
		minlength: 1,
		maxlength: 254,
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_title',
	},
	PRICE : {
		fieldId: 'PRICE',
		type: 'integer',
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_price',
	},
	PRODUCT_ERRORCODE : {
		fieldId: 'PRODUCT_ERRORCODE',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	CONSTRUCTOR_FILE_ID : {
		fieldId: 'CONSTRUCTOR_FILE_ID',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	DESCRIPTION : {
		fieldId: 'DESCRIPTION',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},	
	WARRANTY_DESCRIPTION : {
		fieldId: 'WARRANTY_DESCRIPTION',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	MAXDATEWAITINGREPAIR : {
		fieldId: 'MAXDATEWAITINGREPAIR',
		type: 'date_EN',
		required: 'false',
		redlightOnError: 'true',
	},
	PRODUCT_MANUFACTURER : {
		fieldId: 'PRODUCT_MANUFACTURER',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_constr',
	},
	PRODUCTWORLD_ID : {
		fieldId: 'PRODUCTWORLD_ID',
		type: 'select',
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_PW',
	},
	PRODUCT_MODELNAME : {
		fieldId: 'PRODUCT_MODELNAME',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_model',
	},
	IDENTNUMBER : {
		fieldId: 'IDENTNUMBER',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	SERIALNO : {
		fieldId: 'SERIALNO',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	PRODUCT_DATEOFBUY : {
		fieldId: 'PRODUCT_DATEOFBUY',
		type: 'date_EN',
		required: 'false',
		redlightOnError: 'true',
	},
	CUSTOMER_LASTNAME : {
		fieldId: 'CUSTOMER_LASTNAME',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custLastname',
	},
	CUSTOMER_NAME : {
		fieldId: 'CUSTOMER_NAME',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custFirstname',
	},
	CUSTOMER_PHONE : {
		fieldId: 'CUSTOMER_PHONE',
		type: 'phone_international',
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custPhone',
	},
	CUSTOMER_EMAIL : {
		fieldId: 'CUSTOMER_EMAIL',
		type: 'email',
		required: 'false',
		redlightOnError: 'true',
	},
	CUSTOMER_ADDR_NAME : {
		fieldId: 'CUSTOMER_ADDR_NAME',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custAddrname',
	},
	CUSTOMER_ADDR_NAME2 : {
		fieldId: 'CUSTOMER_ADDR_NAME2',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	CUSTOMER_ADDR_NUM : {
		fieldId: 'CUSTOMER_ADDR_NUM',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	CUSTOMER_ADDR_STREET : {
		fieldId: 'CUSTOMER_ADDR_STREET',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custAddrstreet',
	},
	CUSTOMER_ADDR_STREET2 : {
		fieldId: 'CUSTOMER_ADDR_STREET2',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'false',
		redlightOnError: 'true',
	},
	CUSTOMER_ADDR_ZIPCODE : {
		fieldId: 'CUSTOMER_ADDR_ZIPCODE',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custAddrzip',
	},
	CUSTOMER_ADDR_CITY : {
		fieldId: 'CUSTOMER_ADDR_CITY',
		type: 'string',
		minlength: 1,
		maxlength: 254,
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custAddrcity',
	},
	COUNTRY : {
		fieldId: 'COUNTRY',
		type: 'select',
		required: 'true',
		redlightOnError: 'true',
		errorId: 'new_claim_form_error_custAddrcountry',
	},
};

/**
 * "admin update constructor" form configuration.
 */
site.forms.adminUpdateConstructorForm = {
	CONTACTNAME : {
		fieldId: 'CONTACTNAME',
		type: 'string',
		required: 'true',
		minlength: 2,
		maxlength: 255,
		redlightOnError: 'true',
	}, 
	CONTACTEMAIL : {
		fieldId: 'CONTACTEMAIL',
		type: 'email',
		required: 'true',
		minlength: 1,
		maxlength: 255,
		redlightOnError: 'true',
	},
	STATUS : {
		fieldId: 'STATUS',
		type: 'select',
		required: 'true',
		redlightOnError: 'true',
	},
	COUNTRY : {
		fieldId: 'COUNTRY',
		type: 'select',
		required: 'true',
		redlightOnError: 'true',
	},
	PRODUCTWORLDID : {
		fieldId: 'PRODUCTWORLDID',
		type: 'select2multiple',
		required: 'true',
		redlightOnError: 'true',
	},
	CONTACTPHONE : {
		fieldId: 'CONTACTPHONE',
		type: 'phone_international',
		required: 'false',
		redlightOnError: 'true',
	},
	ADDR_NAME : {
		fieldId: 'ADDR_NAME',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_NAME2 : {
		fieldId: 'ADDR_NAME2',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_NUM : {
		fieldId: 'ADDR_NUM',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_STREET : {
		fieldId: 'ADDR_STREET',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_STREET2 : {
		fieldId: 'ADDR_STREET2',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_ZIPCODE : {
		fieldId: 'ADDR_ZIPCODE',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 6,
		redlightOnError: 'true',
	},
	ADDR_CITY : {
		fieldId: 'ADDR_CITY',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 40,
		redlightOnError: 'true',
	},
};

/*
	form types : 
	
	string
	integer
	password
	email
	select
	select2multiple
	phone_international
	date_EN
*/

/**
 * "admin update repairer" form configuration.
 */
site.forms.adminUpdateRepairerForm = {
	CONTACTLASTNAME : {
		fieldId: 'CONTACTLASTNAME',
		type: 'string',
		required: 'true',
		minlength: 2,
		maxlength: 100,
		redlightOnError: 'true',
	}, 
	CONTACTNAME : {
		fieldId: 'CONTACTNAME',
		type: 'string',
		required: 'true',
		minlength: 2,
		maxlength: 100,
		redlightOnError: 'true',
	},
	CONTACTEMAIL : {
		fieldId: 'CONTACTEMAIL',
		type: 'email',
		required: 'true',
		minlength: 2,
		maxlength: 100,
		redlightOnError: 'true',
	},
	STATUS : {
		fieldId: 'STATUS',
		type: 'select',
		required: 'true',
		redlightOnError: 'true',
	},
	COUNTRY : {
		fieldId: 'COUNTRY',
		type: 'select',
		required: 'true',
		redlightOnError: 'true',
	},
	PRODUCTWORLDID : {
		fieldId: 'PRODUCTWORLDID',
		type: 'select2multiple',
		required: 'true',
		redlightOnError: 'true',
	},
	CONTACTPHONE : {
		fieldId: 'CONTACTPHONE',
		type: 'phone_international',
		required: 'true',
		minlength: 2,
		maxlength: 15,
		redlightOnError: 'true',
	},
	ADDR_NAME : {
		fieldId: 'ADDR_NAME',
		type: 'string',
		required: 'true',
		minlength: 2,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_NAME2 : {
		fieldId: 'ADDR_NAME2',
		type: 'string',
		required: 'false',
		minlength: 2,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_NUM : {
		fieldId: 'ADDR_NUM',
		type: 'string',
		required: 'false',
		minlength: 1,
		maxlength: 30,
		redlightOnError: 'true',
	},
	ADDR_STREET : {
		fieldId: 'ADDR_STREET',
		type: 'string',
		required: 'true',
		minlength: 2,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_STREET2 : {
		fieldId: 'ADDR_STREET2',
		type: 'string',
		required: 'false',
		minlength: 2,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_ZIPCODE : {
		fieldId: 'ADDR_ZIPCODE',
		type: 'string',
		required: 'true',
		minlength: 2,
		maxlength: 40,
		redlightOnError: 'true',
	},
	ADDR_CITY : {
		fieldId: 'ADDR_CITY',
		type: 'string',
		required: 'true',
		minlength: 2,
		maxlength: 40,
		redlightOnError: 'true',
	},
	MAX_DISTANCE_METER : {
		fieldId: 'MAX_DISTANCE_METER',
		type: 'integer',
		required: 'true',
		min: 1,
		max: 99999,
		redlightOnError: 'true',
	},
	MAX_DRIVE_TIME_SECONDS : {
		fieldId: 'MAX_DRIVE_TIME_SECONDS',
		type: 'integer',
		required: 'true',
		min: 1,
		max: 3600,
		redlightOnError: 'true',
	},
};


/**
 * "admin update repairer" form configuration.
 */
site.forms.updateCredentialForm = {
	PWD : {
		fieldId: 'PWD',
		type: 'password',
		required: 'true',
		minlength: 6,
		maxlength: 100,
		redlightOnError: 'true',
		errorId: 'PWD_error',
	},
}
