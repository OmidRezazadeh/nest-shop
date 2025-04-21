export interface PaginationMeta{
    total:number;
    currentPage:number;
    nextPage:number|null;
    prevPage:number|null;
}
export interface PaPaginatedResponse<T>{
    data: T[];
    meta: PaginationMeta;
}
export function paginate<T>(  data: T[],
    total: number,
    page: number,
    limit: number,){


      // Calculate the total number of pages
  const totalPages = Math.ceil(total / limit);
  
  // Ensure currentPage does not exceed totalPages
  const currentPage = page > totalPages ? totalPages : page;

  // Set nextPage only if there is a next page
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  // Set prevPage only if currentPage is greater than 1
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  
  // Return data along with pagination metadata
  return {
    data,
    meta: {
      total,
      currentPage,
      totalPages,
      nextPage,
      prevPage,
    },
  };
    }