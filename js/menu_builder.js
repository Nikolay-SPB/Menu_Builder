/* TODO: localization */
/* TODO: change path to template and css */

var menu_builder = function()
{
    var main_container;
    var main_data;
    var self = this;
    var templates;
    var template_source = 'tpl/all_templates.js';

    var dialogCallback;

    /**
     * Init function
     * @param data
     * @param container
     * @param template_path If not specified then default file will be used ( tpl/all_templates.js )
     * @returns {menu_builder}
     */
    this.init = function(data, container, template_path)
    {
        main_container = container;
        main_data = data;

        if (template_path) {
            template_source = template_path;
        }

        self.loadTemplate();

        return self;
    };

    this.loadTemplate = function()
    {
        var tpl = document.createElement('script');
        tpl.src = template_source;
        document.body.insertBefore(tpl, document.body.children[0]);

        tpl.onload = function()
        {
            templates = menu_builder_templates;

            main_container.append(templates.addMainCategoryButton);
            main_container.append(templates.getCategoryBox);

            self.renderData(main_data);
            self.handleEvents(main_container);
        };
    };

    this.renderData = function(data, level)
    {
        var i, ul;
        level = level ? level : 0;

        if (level == 0) {
            main_container.append('<ul class="ul-level-' + level + '"></ul>');
        } else {
            ul = main_container.find('ul.ul-level-'+(level-1)).last();

            ul.append('<ul class="ul-level-' + level + '"></ul>');
        }

        for (i in data) {
            ul = main_container.find('ul.ul-level-'+level).last();

            ul.append(
                templates.itemTemplate(data[i].link, data[i].title)
            );
            if (data[i].children) {
                self.renderData(data[i].children, level+1);
            }
        }
    };

    this.handlerAddCategory = function(element)
    {
        var ul = $(element).parent().next('ul');
        var item = $(element);

        var level = Number($(element).parent().parent().attr('class').match(/ul-level-([0-9]+)/)[1]);

        self.getCategoryInfo(function(title, link)
        {
            if (title && link) {
                if (ul.length > 0) {
                    ul.append(
                        templates.itemTemplate(link, title)
                    );
                } else {
                    item.parent().after(
                        templates.itemTemplateWithContainer(level+1, link, title)
                    );
                }
            }
        });
    };

    this.handlerDeleteCategory = function(element)
    {
        if (confirm('Are you sure that you want to delete this category? If category contains subcategories, all subcategories will be deleted also.')) {
            var ul = $(element).parent().parent();
            var li = $(element).parent();
            var ul_w_childs = $(element).parent().next('ul');

            if (ul.find('li').length == 1) {
                li.remove();
                ul.remove();
            } else {
                li.remove();
            }

            if (ul_w_childs.length > 0) {
                ul_w_childs.remove();
            }
        }
    };

    this.handlerEditCategory = function(element)
    {
        var a = $(element).parent().children('a').first();

        self.getCategoryInfo(function(title, link)
        {
            a.text(title);
            a.attr('href', link);

        }, a.text(), a.attr('href'));
    };

    this.handlerUpItem = function(element)
    {
        element = $(element);
        var ul = element.parent().next('ul');

        var siblings = element.parent().prevAll('li');

        if (siblings.length > 0) {
            $(siblings[0]).before(element.parent());

            if (ul.length > 0) {
                $(siblings[0]).before(ul);
            }
        }
    };

    this.handlerDownItem = function(element)
    {
        element = $(element);
        var ul = element.parent().next('ul');

        var siblings = element.parent().nextAll('li');
        var siblings_ul = $(siblings[0]).next('ul');

        if (siblings.length > 0) {
            if (siblings_ul.length > 0) {
                if (ul.length > 0) {
                    siblings_ul.length.after(ul);
                }

                siblings_ul.after(element.parent());
            } else {
                if (ul.length > 0) {
                    $(siblings[0]).after(ul);
                }

                $(siblings[0]).after(element.parent());
            }
        }
    };

    this.handleEvents = function()
    {
        var add_button = main_container.find('.add');

        /* Main delegate */
        main_container.click(function(e)
        {
            switch (e.target.className) {
                case 'add-item':
                    self.handlerAddCategory(e.target);
                    return false;
                    break;

                case 'delete-item':
                    self.handlerDeleteCategory(e.target);
                    return false;
                    break;

                case 'edit-item':
                    self.handlerEditCategory(e.target);
                    return false;
                    break;

                case 'up-item':
                    self.handlerUpItem(e.target);
                    return false;
                    break;

                case 'down-item':
                    self.handlerDownItem(e.target);
                    return false;
                    break;
            }
        });

        $('#add-main-cat').click(function()
        {
            self.getCategoryInfo(function(title, link)
            {
                if (title && link) {
                    main_container.find('.ul-level-0').append( templates.itemTemplate(link, title) );
                }
            });
        });

        main_container.find('.b-add').click(function()
        {
            var add_button = main_container.find('.add');

            var title = add_button.find('input.textInput').val();
            var link = add_button.find('input.linkInput').val();

            dialogCallback(title, link);

            add_button.find('input.textInput').val('');
            add_button.find('input.linkInput').val('');

            add_button.hide();
        });

        main_container.find('.close').click(function()
        {
            $(this).parent().hide();

            return false;
        });
    };

    this.getCategoryInfo = function(callback, initial_title, initial_link)
    {
        var add_button = main_container.find('.add');

        dialogCallback = callback;

        if (initial_title)
            main_container.find('input.textInput').val(initial_title);

        if (initial_link)
            main_container.find('input.linkInput').val(initial_link);

        add_button.show();
    };

    this.exportMenuToJSON = function(level, object)
    {
        var endJSON = [];

        level = level || 0;

        if (level == 0) {
            $('ul.ul-level-' + level + ' > li').each(function () {
                endJSON.push({
                    title: $(this).find('a:nth-child(1)').html(),
                    link: $(this).find('a:nth-child(1)').attr('href')
                });

                if ($(this).next('ul').length > 0) {
                    endJSON[endJSON.length - 1].children = self.exportMenuToJSON(level + 1, $(this).next('ul'));
                }
            });
        } else {
            object.children('li').each(function ()
            {
                endJSON.push({
                    title: $(this).find('a:nth-child(1)').html(),
                    link: $(this).find('a:nth-child(1)').attr('href')
                });

                if ($(this).next('ul').length > 0) {
                    endJSON[endJSON.length - 1].children = self.exportMenuToJSON(level + 1, $(this).next('ul'));
                }
            });
        }

        return endJSON;
    };
};