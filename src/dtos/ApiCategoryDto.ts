export default interface ApiCategoryDto { //podaci sa kojima radimo
    categoryId: number;
    name: string;
    imagePath: string;
    parentCategoryId: number | null;
}