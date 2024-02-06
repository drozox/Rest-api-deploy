const z= require('zod')

const movieSchema= z.object({
    title:z.string({
        invalid_type_erro:'Movie title must to be a string',
        required_error:'movie title is required'
    }),
    year:z.number().int().min(1900),
    director: z.string(),
    duration:z.number().int().min(1),
    genre: z.array(z.enum(['Action','Drama']))
    
})

function validateMovie(object){
    return movieSchema.safeParse(object)
}

function validatePartialMovie(input){
    return movieSchema.partial().safeParse(input)//partial hace que todas los elementos del esquema sean opcionales.

}

module.exports ={
    validateMovie,
    validatePartialMovie
}