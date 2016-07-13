jQuery(document).ready(function (jQuery) {

    // get the url parameter to create the UI
    var wizard = bf_getUrlParameter('wizard');
    var type   = bf_getUrlParameter('type');

    // Get out of here if not the wizard view
    if (wizard == null) {
        return false;
    }

    // Grab all needed form parts from the dom and add it into vars for later usage.
    if(wizard != null){
        // first hide all so we have a consitend feeling
        jQuery('#post, #postbox-container-1, #postbox-container-2').hide();

        // get the parts
        var title                       = jQuery('#post-body-content');
        var buddyforms_form_elements    = jQuery('#buddyforms_form_elements');
        var buddyforms_template         = jQuery('.buddyforms_template');
        var buddyforms_metabox_sidebar  = jQuery('#buddyforms_metabox_sidebar');
        var buddyforms_notification     = jQuery('#notification');
        var buddyforms_permission       = jQuery('#permission');
        var buddyforms_create_content   = jQuery('#create-content');
        var buddyforms_edit_submissions = jQuery('#edit-submissions');

    }

    // Workaround for now. Change the url and reload. Would love to have this step just start the wizard. Help Needed from a guru
    jQuery(document.body).on('click', '.bf_wizard_types', function () {
        URL  = document.URL;
        type = jQuery(this).attr('data-type');
        URL = URL.replace('wizard=1','wizard=2&type=' + type);
        window.location = URL;
    });


    // STEP 1 Select the Form Type
    if(wizard == 1){
        select_form_type();
    }

    // STEP 2 Start the Wizard
    if(wizard == 2){
        start_wizard();
    }

    // Get the Form Type Templates for Step 1
    function select_form_type(){
        jQuery.ajax({
            type: 'POST',
            url: ajaxurl,
            data: {"action": "buddyforms_form_builder_wizard_types"},
            success: function (data) {
                jQuery('#poststuff').html('<h2>Select the form type you want to create to start the correct Wizard</h2>');
                jQuery( data ).appendTo( '#poststuff' );
                jQuery('#post').show();

            }
        });
    }

    // Ok now let us start the wizard
    function start_wizard(){

        // Add a Label for the Wizard
        jQuery( '#poststuff' ).html('<h2>BuddyForms "' + type.toUpperCase() + '" Form Wizard</h2>');

        // Add a hidden input with the form type for later usage
        jQuery( '<input id="bf-form-type-select" name="buddyforms_options[form_type]" type="hidden" value="'+type+'">' ).appendTo( '#poststuff' );

        // Create the html for the contact form steps
        jQuery(
            '<div id="hooker-steps"> ' +
            '<h3>Title</h3><section><div id="bf-hooker-name"></div></section>' +
            '</div>'
        ).appendTo( '#poststuff' );




        // Check if form type is post and add additional steps to the wizard
        if(type == 'post'){
            jQuery('<h3>Create Content</h3><section><div id="bf-hooker-create-content"></div></section>' +
                '<h3>Attached Page</h3><section><div id="bf-hooker-edit-submissions"></div></section>'
                ).appendTo( '#hooker-steps' );

            // Add the form parts for create and edit to the wizard sections
            jQuery( buddyforms_create_content ).appendTo( '#bf-hooker-create-content' );
            jQuery( buddyforms_edit_submissions ).appendTo( '#bf-hooker-edit-submissions' );
        }

        jQuery('<h3>Add Elements</h3><section><div id="bf-hooker-formbuilder"></div></section>' +
        '<h3>Mail Notification</h3><section><div id="bf-hooker-notifications"></div></section>' +
        '<h3>Permissions</h3><section><div id="bf-hooker-permissions"></div></section>'
        ).appendTo( '#hooker-steps' );


        // Add the form parts to the steps sections
        jQuery( title ).appendTo( '#bf-hooker-name' );
        jQuery( buddyforms_form_elements ).appendTo( '#bf-hooker-formbuilder' );
        jQuery( buddyforms_notification ).appendTo( '#bf-hooker-notifications' );
        jQuery( buddyforms_permission ).appendTo( '#bf-hooker-permissions' );


        // Change the Form Builder h2 Title
        jQuery('#buddyforms_form_elements h2 span').html('Add Form Elements to your Form by clicking the form element link');

        // Hide the normal form builder templates. They are not needed.
        jQuery( buddyforms_template).hide()

        // Get all form elements for the selected form type and add them to the form builder
        jQuery.ajax({
            type: 'POST',
            url: ajaxurl,
            data: {"action": "buddyforms_form_builder_wizard_elements", "type": type},
            success: function (data) {

                jQuery('#formbuilder-actions-wrap').html(data);

            }
        });

        // All should be in place show the wizard
        var form = jQuery('#post').show();

        // Let us initial and  start the wizard Steps
        // $("#example-basic").steps({
        form.find('#hooker-steps' ).steps({
            headerTag: "h3",
            bodyTag: "section",
            transitionEffect: "slideLeft",
            autoFocus: true,
            enableFinishButton: true,
            saveState: false,
            startIndex: 0,
            onStepChanging: function (event, currentIndex, newIndex)
            {

                // Validate Step 1 the form label
                if(currentIndex == 0) {

                    var create_new_form_name = jQuery('[name="post_title"]').val();

                    var error = false;
                    if (create_new_form_name === '') {
                        jQuery('[name="post_title"]').removeClass('bf-ok');
                        jQuery('[name="post_title"]').addClass('bf-error');
                        error = true;
                    } else {
                        jQuery('[name="post_title"]').removeClass('bf-error');
                        jQuery('[name="post_title"]').addClass('bf-ok');
                    }
                    if (error === true) {
                        return false;
                    }

                    return true;

                }

                // Validate Step 2 the form builder form elements
                if(currentIndex == 1) {

                    if(type == 'post'){
                       var post_type = jQuery('#form_post_type').val();
                       if( post_type == 'bf_submissions' ){

                           jQuery('#form_post_type').addClass('bf-error');
                           return false;
                       } else {
                           jQuery('#form_post_type').addClass('bf-ok');
                           return true;
                       }
                    } else {
                        var error = false;
                        // traverse all the required elements looking for an empty one
                        jQuery("#buddyforms_forms_builder input[required]").each(function () {

                            // if the value is empty, that means that is invalid
                            if (jQuery(this).val() == "") {

                                jQuery(this).addClass('bf-error');
                                error = true;
                                jQuery(".accordion-body.collapse.in").removeClass("in");
                                jQuery(this).closest(".accordion-body.collapse").addClass("in").css("height", "auto");
                                jQuery('#buddyforms_form_setup').removeClass('closed');
                                jQuery('#buddyforms_form_elements').removeClass('closed');
                            }
                        });
                        if (error === true) {
                            return false;
                        }
                    }



                    return true;
                }
                if(currentIndex == 2) {
                    return true;
                }
                if(currentIndex == 3) {
                    if(type == 'post'){
                        var error = false;
                        // traverse all the required elements looking for an empty one
                        jQuery("#buddyforms_forms_builder input[required]").each(function () {

                            // if the value is empty, that means that is invalid
                            if (jQuery(this).val() == "") {

                                jQuery(this).addClass('bf-error');
                                error = true;
                                jQuery(".accordion-body.collapse.in").removeClass("in");
                                jQuery(this).closest(".accordion-body.collapse").addClass("in").css("height", "auto");
                                jQuery('#buddyforms_form_setup').removeClass('closed');
                                jQuery('#buddyforms_form_elements').removeClass('closed');
                            }
                        });
                        if (error === true) {
                            return false;
                        }
                    }

                    return true;
                }
                if(currentIndex == 4) {
                    return true;
                }
                if(currentIndex == 5) {
                    return true;
                }

            },
            onFinishing: function (event, currentIndex)
            {

                return true;
            },
            onFinished: function (event, currentIndex)
            {
                // Submit form input
                form.submit();
            }
        });

    }
});