require 'rugged'
require 'linguist'

repo = Rugged::Repository.new('.')
project = Linguist::Repository.new(repo, repo.head.target_id)
print project.language       #=> "Ruby
print project.languages      #=> { "Ruby" => 119387 }
