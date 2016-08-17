'use strict';
/*!
 * Form.
 * Vue componenet.
 *
 * @author Alejandro Mostajo <http://about.me/amostajo>
 * @copyright 10Quality <http://www.10quality.com>
 * @license MIT
 * @version 1.0.4
 */
Vue.component('vform', Vue.extend({
    props:
    {
        /**
         * Request action url.
         * @since 1.0.0
         * @var string
         */
        action:
        {
            type: String,
            default: '',
        },
        /**
         * Request method.
         * @since 1.0.0
         * @var string
         */
        method:
        {
            type: String,
            default: 'POST',
        },
        /**
         * Request headers.
         * @since 1.0.1
         * @var object
         */
        headers:
        {
            type: Object,
            default: function() { return undefined; },
        },
        /**
         * Request timeout.
         * @since 1.0.1
         * @var int
         */
        timeout:
        {
            type: [String, Number],
            default: undefined,
        },
        /**
         * Flag that indicates if request has credentials.
         * @since 1.0.1
         * @var int
         */
        credentials:
        {
            type: [String, Boolean],
            default: undefined,
        },
        /**
         * Flag that indicates if request should emulate HTTP.
         * @since 1.0.1
         * @var bool
         */
        emulateHttp:
        {
            type: [String, Boolean],
            default: undefined,
        },
        /**
         * Flag that indicates if request should emulate JSON.
         * @since 1.0.1
         * @var bool
         */
        emulateJson:
        {
            type: [String, Boolean],
            default: undefined,
        },
        /**
         * List of default errors.
         * @since 1.0.2
         * @var object
         */
        errors:
        {
            type: Object,
            default: function() {
                return {
                    required: 'Required field.',
                    number: 'Value must be numeric.',
                    email: 'Email value is invalid.',
                    min: 'Value must have at least %1% character(s).',
                    min_number: 'Value must be at least %1%.',
                    max: 'Value must have no more than %1% character(s).',
                    max_number: 'Value must be no more than %1%.',
                    between: 'Value must have between %1% to %2% characters.',
                    between_number: 'Value must be between %1% to %2%.',
                };
            },
        },
    },
    data: function() {
        return {
            /**
             * Request data.
             * @since 1.0.0
             * @var object
             */
            request: {},
            /**
             * Flag that indicates if component is loading.
             * @since 1.0.0
             * @var bool
             */
            isLoading: false,
            /**
             * Response data.
             * @since 1.0.0
             * @var object
             */
            response: {},
        };
    },
    computed:
    {
        /** 
         * Returns flag indicating if response has a message.
         * @since 1.0.0
         * @return bool
         */
        hasMessage: function()
        {
            return this.response.message != undefined;
        },
        /** 
         * Returns flag indicating if response has an error or not.
         * @since 1.0.0
         * @return bool
         */
        hasError: function()
        {
            return this.response.error != undefined
                && this.response.error;
        },
    },
    methods:
    {
        /**
         * Submits form.
         * @since 1.0.0
         * @since 1.0.1 Options generated based on method.
         * @since 1.0.2 Validations added.
         */
        submit: function()
        {
            // Input validations
            var isValid = true;
            this.$set('response', {});
            for (var i in this.$children) {
                if (typeof(this.$children[i].validate) === 'function')
                    isValid = this.$children[i].validate() && isValid;
            }
            if (isValid) {
                this.$set('isLoading', true);
                this.$http(this.getOptions()).then(this.onSubmit, this.onError);
            } else {
                this.$dispatch('vform_invalid', this.response.errors);
                this.$broadcast('vform_invalid', this.response.errors);
            }
        },
        /**
         * Handles submission response.
         * @since 1.0.0
         * @since 1.0.1 Added event dispatch.
         * @since 1.0.3 Added event broadcast.
         * @since 1.0.4 Response errors triggers invalid event.
         *
         * @param object response Response
         */
        onSubmit: function(response)
        {
            this.$set('response', response.data);
            this.$dispatch('vform_success');
            this.$broadcast('vform_success');
            if (this.response.errors !== undefined && this.response.errors.length > 0) {
                this.$dispatch('vform_invalid', this.response.errors);
                this.$broadcast('vform_invalid', this.response.errors);
            }
            if (response.data.redirect !== undefined)
                return window.location = response.data.redirect;
            this.onComplete();
        },
        /**
         * Handles on complete submission
         * @since 1.0.0
         * @since 1.0.1 Added event dispatch.
         * @since 1.0.3 Added event broadcast.
         */
        onComplete: function()
        {
            this.$set('isLoading', false);
            this.$dispatch('vform_complete');
            this.$broadcast('vform_complete');
        },
        /** 
         * Handles submission error.
         * @since 1.0.0
         * @since 1.0.1 Added event dispatch.
         * @since 1.0.3 Added event broadcast.
         *
         * @param object e Error
         */
        onError: function(e)
        {
            console.log(e);
            this.$dispatch('vform_error', e);
            this.$broadcast('vform_error', e);
            this.onComplete();
        },
        /**
         * Returns request options based on method.
         * @since 1.0.1
         *
         * @return object
         */
        getOptions: function()
        {
            var options = {
                url: this.action,
                method: this.method,
            };
            if (this.headers !== undefined)
                options.headers = this.headers;
            if (this.timeout !== undefined)
                options.timeout = this.timeout;
            if (this.credentials !== undefined)
                options.credentials = typeof(this.credentials) === 'boolean'
                    ? this.credentials
                    : this.credentials === 'true';
            if (this.emulateHttp !== undefined)
                options.emulateHTTP = typeof(this.emulateHttp) === 'boolean'
                    ? this.emulateHttp
                    : this.emulateHttp === 'true';
            if (this.emulateJson !== undefined)
                options.emulateJSON = typeof(this.emulateJson) === 'boolean'
                    ? this.emulateJson
                    : this.emulateJson === 'true';
            switch (this.method) {
                case 'post':
                case 'POST':
                case 'put':
                case 'PUT':
                case 'patch':
                case 'PATCH':
                    options.body = this.request;
                    break;
                default:
                    options.params = this.request;
                    break;
            }
            return options;
        },
    },
    components:
    {
        /**
         * Input Handler.
         * Handles input errors.
         * Vue sub component.
         * @since 1.0.2
         */
        'input-handler': Vue.extend({
            template: '<div :class="[class,errorCss]"><slot></slot><div class="errors"><ul><li v-for="(index, error) in inputErrors" track-by="$index">{{error}}</li></ul></div></div>',
            props:
            {
                /**
                 * Name of the error key to listen to.
                 * @since 1.0 
                 * @var string
                 */
                listen:
                {
                    type: String,
                    default: '',
                },
                /**
                 * CSS class to apply to wrapper.
                 * @since 1.0 
                 * @var string
                 */
                class:
                {
                    type: String,
                    default: '',
                },
                /**
                 * CSS class to apply to wrapper when errors are available.
                 * @since 1.0 
                 * @var string
                 */
                classError:
                {
                    type: String,
                    default: undefined,
                },
                /**
                 * Input errors to listen to.
                 * @since 1.0
                 * @var object
                 */
                response:
                {
                    type: [Object, Array],
                    default: function() {
                        return {};
                    },
                },
                /**
                 * List of validation rules to perform before request is sent.
                 * @since 1.0.2
                 * @var string
                 */
                validations:
                {
                    type: String,
                    default: '',
                },
            },
            computed:
            {
                /**
                 * Input specific errors.
                 * @since 1.0.0
                 * @return array
                 */
                inputErrors: function()
                {
                    var errors = [];
                    if (this.response.errors !== undefined
                        && this.response.errors[this.listen] !== undefined
                    ) {
                        errors = this.response.errors[this.listen];
                    }
                    return errors;
                },
                /**
                 * Flag that indicates if there are errors.
                 * @since 1.0.0
                 * @return bool
                 */
                hasErrors: function()
                {
                    return this.inputErrors.length > 0;
                },
                /**
                 * Erros css to apply to wrapper.
                 * @since 1.0.0
                 * @since 1.0.2 Fix for when error class is not present.
                 * @return object
                 */
                errorCss: function()
                {
                    var css = {};
                    if (this.classError !== undefined)
                        css[this.classError] = this.hasErrors;
                    return css;
                }
            },
            methods:
            {
                /**
                 * Validates input.
                 * @since 1.0.2
                 *
                 * @return bool
                 */
                validate: function()
                {
                    var success = true;
                    var rules = this.validations.split('|');
                    for (var i in rules) {
                        var options = rules[i].split(':');
                        switch (options[0]) {
                            case 'required':
                                if (this.$parent.request[this.listen] === undefined
                                    || this.$parent.request[this.listen].length === 0
                                ) {
                                    this.addError(options);
                                    success = false;
                                }
                                break;
                            case 'number':
                                if (this.$parent.request[this.listen] !== undefined
                                    && this.$parent.request[this.listen].length > 0
                                    && isNaN(this.$parent.request[this.listen])
                                ) {
                                    this.addError(options);
                                    success = false;
                                }
                                break;
                            case 'min':
                                if (options.length < 2)
                                    throw 'Minimum value is not defined in validation rules';
                                if (this.$parent.request[this.listen] !== undefined
                                    && this.$parent.request[this.listen].length > 0
                                    && this.$parent.request[this.listen].length < parseInt(options[1])
                                ) {
                                    this.addError(options);
                                    success = false;
                                }
                                break;
                            case 'min_number':
                                if (options.length < 2)
                                    throw 'Minimum value is not defined in validation rules';
                                if (this.$parent.request[this.listen] !== undefined
                                    && parseInt(this.$parent.request[this.listen]) < parseInt(options[1])
                                ) {
                                    this.addError(options);
                                    success = false;
                                }
                                break;
                            case 'max':
                                if (options.length < 2)
                                    throw 'Maximum value is not defined in validation rules';
                                if (this.$parent.request[this.listen] !== undefined
                                    && this.$parent.request[this.listen].length > 0
                                    && this.$parent.request[this.listen].length > parseInt(options[1])
                                ) {
                                    this.addError(options);
                                    success = false;
                                }
                                break;
                            case 'max_number':
                                if (options.length < 2)
                                    throw 'Minimum value is not defined in validation rules';
                                if (this.$parent.request[this.listen] !== undefined
                                    && parseInt(this.$parent.request[this.listen]) > parseInt(options[1])
                                ) {
                                    this.addError(options);
                                    success = false;
                                }
                                break;
                            case 'between':
                                if (options.length < 3)
                                    throw 'One or all between values are not defined in validation rules';
                                if (this.$parent.request[this.listen] !== undefined
                                    && this.$parent.request[this.listen].length > 0
                                    && (this.$parent.request[this.listen].length < parseInt(options[1])
                                        || this.$parent.request[this.listen].length > parseInt(options[2])
                                    )
                                ) {
                                    this.addError(options);
                                    success = false;
                                }
                                break;
                            case 'between_number':
                                if (options.length < 3)
                                    throw 'One or all between values are not defined in validation rules';
                                if (this.$parent.request[this.listen] !== undefined
                                    && (parseInt(this.$parent.request[this.listen]) < parseInt(options[1])
                                        || parseInt(this.$parent.request[this.listen]) > parseInt(options[2])
                                    )
                                ) {
                                    this.addError(options);
                                    success = false;
                                }
                                break;
                            case 'email':
                                var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                                if (this.$parent.request[this.listen] !== undefined
                                    && !regex.test(this.$parent.request[this.listen])
                                ) {
                                    this.addError(options);
                                    success = false;
                                }
                                break;
                        }
                    }
                    return success;
                },
                /**
                 * Adds error to response.
                 * @since 1.0.2
                 *
                 * @param object options
                 */
                addError: function(options)
                {
                    if (this.$parent.response === undefined)
                        this.$parent.$set('response', {});
                    if (this.$parent.response.errors === undefined)
                        this.$parent.$set('response.errors', {});
                    if (this.$parent.response.errors[this.listen] === undefined)
                        this.$parent.$set('response.errors.'+this.listen, []);
                    var message = this.$parent.errors[options[0]];
                    if (options.length > 1)
                        message = message.replace(/\%1\%/, options[1]);
                    if (options.length > 2)
                        message = message.replace(/\%2\%/, options[2]);
                    this.$parent.response.errors[this.listen].push(message);
                },
            },
        }),
        /**
         * Results.
         * Handles response results.
         * Vue sub component.
         * @since 1.0.0
         */
        'results': Vue.extend({
            props:
            {
                /**
                 * Results model.
                 * @since 1.0.0
                 * @var mixed
                 */
                model:
                {
                    type: [Array, Object, String],
                    default: function()
                    {
                        return [];
                    },
                },
                /**
                 * Form request.
                 * @since 1.0.0
                 * @var mixed
                 */
                request:
                {
                    type: Object,
                    default: function()
                    {
                        return {};
                    },
                },
                /**
                 * Flag that indicates if results should be fetched on ready.
                 * @since 1.0.0
                 * @var bool
                 */
                fetchOnready:
                {
                    type: [String, Boolean],
                    default: false,
                },
                /**
                 * Flag that indicates if results should clear on fetch or not.
                 * @since 1.0.0
                 * @var bool
                 */
                clearOnFetch:
                {
                    type: [String, Boolean],
                    default: true,
                },
            },
            data: function()
            {
                return {
                    /**
                     * Records to display.
                     * @since 1.0.0
                     * @var array
                     */
                    buffer: [],
                };
            },
            computed:
            {
                /**
                 * Returns computed records.
                 * @since 1.0.0
                 *
                 * @return array
                 */
                records: function()
                {
                    if (!this.$parent.hasMessage && Array.isArray(this.model)) {
                        if (this.clearOnFetch) {
                            this.$set('buffer', this.model);
                        } else {
                            for (var i in this.model) {
                                if (this.model[i] !== undefined && this.model[i] !== null)
                                    this.buffer.push(this.model[i]);
                            }
                        }
                    }
                    return this.buffer;
                },
                /**
                 * Returns flag indicating if records are present.
                 * @since 1.0.0
                 *
                 * @return bool
                 */
                hasRecords: function()
                {
                    return this.records.length > 0;
                },
            },
            ready: function()
            {
                if (this.fetchOnready)
                    this.$parent.submit();
            },
        }),
    },
}));