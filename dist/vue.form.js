'use strict';
/*!
 * Form.
 * Vue componenet.
 *
 * @author Alejandro Mostajo <http://about.me/amostajo>
 * @copyright 10Quality <http://www.10quality.com>
 * @license MIT
 * @version 1.0.1
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
         */
        submit: function()
        {
            this.$set('isLoading', true);
            this.$http(this.getOptions()).then(this.onSubmit, this.onError);
        },
        /**
         * Handles submission response.
         * @since 1.0.0
         * @since 1.0.1 Added event dispatch.
         *
         * @param object response Response
         */
        onSubmit: function(response)
        {
            this.$set('response', response.data);
            this.$dispatch('vform_success');
            if (response.data.redirect != undefined)
                return window.location = response.data.redirect;
            this.onComplete();
        },
        /**
         * Handles on complete submission
         * @since 1.0.0
         * @since 1.0.1 Added event dispatch.
         */
        onComplete: function()
        {
            this.$set('isLoading', false);
            this.$dispatch('vform_complete');
        },
        /** 
         * Handles submission error.
         * @since 1.0.0
         * @since 1.0.1 Added event dispatch.
         *
         * @param object e Error
         */
        onError: function(e)
        {
            console.log(e);
            this.$dispatch('vform_error', e);
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
         * @since 1.0.0
         */
        'input-handler': Vue.extend({
            template: '<div :class="[class,errorCss]"><slot></slot><div class="errors"><ul><li v-for="error in inputErrors" track-by="$index">{{error}}</li></ul></div></div>',
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
                    default: '',
                },
                /**
                 * Input errors to listen to.
                 * @since 1.0
                 * @var object
                 */
                response:
                {
                    type: Object,
                    default: function() {
                        return {};
                    },
                },
            },
            computed:
            {
                /**
                 * Input specific errors.
                 * @since 1.0
                 * @return array
                 */
                inputErrors: function()
                {
                    var errors = [];
                    if (this.response.errors != undefined
                        && this.response.errors[this.listen] != undefined
                    ) {
                        errors = this.response.errors[this.listen];
                    }
                    return errors;
                },
                /**
                 * Flag that indicates if there are errors.
                 * @since 1.0
                 * @return bool
                 */
                hasErrors: function()
                {
                    return this.inputErrors.length > 0;
                },
                /**
                 * Erros css to apply to wrapper.
                 * @since 1.0
                 * @return object
                 */
                errorCss: function()
                {
                    var css = {};
                    css[this.classError] = this.hasErrors;
                    return css;
                }
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