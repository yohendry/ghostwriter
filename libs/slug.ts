// kindacode.com
export function slug(title: string, glue: string = "-") {
  let slug;

  // convert to lower case
  slug = title.toLowerCase();

  // remove special characters
  slug = slug.replace(
    /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi,
    "",
  );
  // The /gi modifier is used to do a case insensitive search of all occurrences of a regular expression in a string

  // replace spaces with dash symbols
  slug = slug.replace(/ /gi, glue);

  // remove consecutive dash symbols
  slug = slug.replace(/\-\-\-\-\-/gi, glue);
  slug = slug.replace(/\-\-\-\-/gi, glue);
  slug = slug.replace(/\-\-\-/gi, glue);
  slug = slug.replace(/\-\-/gi, glue);

  // remove the unwanted dash symbols at the beginning and the end of the slug
  slug = "@" + slug + "@";
  slug = slug.replace(/\@\-|\-\@|\@/gi, "");
  return slug;
}
